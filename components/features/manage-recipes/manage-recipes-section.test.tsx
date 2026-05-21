import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ManageRecipesSection } from './manage-recipes-section'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockFetchRecipes = jest.fn()
const mockGetFilteredRecipes = jest.fn(() => [])
const mockUseRecipes = jest.fn(() => ({
  loading: false,
  error: null,
  nextCursor: null,
  fetchRecipes: mockFetchRecipes,
  getFilteredRecipes: mockGetFilteredRecipes,
  recipes: [],
}))

jest.mock('@/hooks/use-recipes', () => ({
  useRecipes: () => mockUseRecipes(),
}))

jest.mock('./recipe-card', () => ({
  RecipeCard: ({ recipe, onView }: { recipe: { id: string; name: string }; onView: (id: string) => void }) => (
    <div data-testid="recipe-card">
      <button data-testid={`view-${recipe.id}`} onClick={() => onView(recipe.id)}>
        {recipe.name}
      </button>
    </div>
  ),
}))

jest.mock('./recipe-filters', () => ({
  RecipeFilters: () => <div data-testid="recipe-filters">RecipeFilters</div>,
}))

jest.mock('./manage-recipes-skeleton', () => ({
  RecipeSkeleton: () => <div data-testid="recipe-skeleton">Skeleton</div>,
}))

const sampleRecipe = {
  id: 'r1',
  user_id: 'u1',
  name: 'Bolo de Chocolate',
  description: 'Receita deliciosa',
  reference_portions: 8,
  status: 'completed' as const,
  chef_notes: null,
  cost_per_portion: '2.50',
  total_recipe_cost: '20.00',
  total_ingredient_cost: null,
  total_preparation_cost: null,
  selling_price_per_portion: null,
}

describe('ManageRecipesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title, subtitle and back button', () => {
    render(<ManageRecipesSection />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
    expect(screen.getByTestId('section-back-button')).toBeInTheDocument()
  })

  it('calls onSectionChange with dashboard when Back is clicked', () => {
    const onSectionChange = jest.fn()
    render(<ManageRecipesSection onSectionChange={onSectionChange} />)
    fireEvent.click(screen.getByTestId('section-back-button'))
    expect(onSectionChange).toHaveBeenCalledWith('dashboard')
  })

  it('renders recipe filters', () => {
    render(<ManageRecipesSection />)
    expect(screen.getByTestId('recipe-filters')).toBeInTheDocument()
  })

  it('calls fetchRecipes on mount', () => {
    render(<ManageRecipesSection />)
    expect(mockFetchRecipes).toHaveBeenCalledWith()
  })

  it('shows skeletons when loading', () => {
    mockUseRecipes.mockReturnValueOnce({
      loading: true,
      error: null,
      nextCursor: null,
      fetchRecipes: mockFetchRecipes,
      getFilteredRecipes: mockGetFilteredRecipes,
      recipes: [],
    })
    render(<ManageRecipesSection />)
    expect(screen.getAllByTestId('recipe-skeleton').length).toBeGreaterThan(0)
  })

  it('shows empty state when no recipes', () => {
    render(<ManageRecipesSection />)
    expect(screen.getByText('emptyState.title')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /emptyState\.action/i })).toBeInTheDocument()
  })

  it('renders recipe cards when recipes exist', () => {
    mockGetFilteredRecipes.mockReturnValue([sampleRecipe])
    render(<ManageRecipesSection />)
    expect(screen.getAllByTestId('recipe-card')).toHaveLength(1)
    expect(screen.getByText('Bolo de Chocolate')).toBeInTheDocument()
  })

  it('opens detail modal when view is clicked', () => {
    mockGetFilteredRecipes.mockReturnValue([sampleRecipe])
    render(<ManageRecipesSection />)
    fireEvent.click(screen.getByTestId('view-r1'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes detail modal when close button is clicked', async () => {
    mockGetFilteredRecipes.mockReturnValue([sampleRecipe])
    render(<ManageRecipesSection />)
    fireEvent.click(screen.getByTestId('view-r1'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /detail\.close/i }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('shows error state and retry button on error', () => {
    mockUseRecipes.mockReturnValueOnce({
      loading: false,
      error: 'Failed to load recipes',
      nextCursor: null,
      fetchRecipes: mockFetchRecipes,
      getFilteredRecipes: mockGetFilteredRecipes,
      recipes: [],
    })
    render(<ManageRecipesSection />)
    expect(screen.getByText('errorState.title')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /errorState\.retry/i })).toBeInTheDocument()
  })

  it('calls fetchRecipes again when retry is clicked', () => {
    mockUseRecipes.mockReturnValueOnce({
      loading: false,
      error: 'Failed',
      nextCursor: null,
      fetchRecipes: mockFetchRecipes,
      getFilteredRecipes: mockGetFilteredRecipes,
      recipes: [],
    })
    render(<ManageRecipesSection />)
    fireEvent.click(screen.getByRole('button', { name: /errorState\.retry/i }))
    expect(mockFetchRecipes).toHaveBeenCalledTimes(2)
  })

  it('shows load more button when nextCursor exists', () => {
    mockUseRecipes.mockReturnValueOnce({
      loading: false,
      error: null,
      nextCursor: 'cursor-abc',
      fetchRecipes: mockFetchRecipes,
      getFilteredRecipes: mockGetFilteredRecipes,
      recipes: [],
    })
    mockGetFilteredRecipes.mockReturnValue([sampleRecipe])
    render(<ManageRecipesSection />)
    expect(screen.getByRole('button', { name: /loadMore/i })).toBeInTheDocument()
  })
})
