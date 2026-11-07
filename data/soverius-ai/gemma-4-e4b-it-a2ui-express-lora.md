# soverius-ai/gemma-4-E4B-it-A2UI-Express-LoRA

## Resumen

Gemma 4 E4B IT A2UI Express LoRA es un adaptador LoRA de bajo rango (rank 8, escala 2.0) desarrollado por soverius-ai sobre el modelo base `unsloth/gemma-4-E4B-it` de Google. Su propósito es especializar al modelo en la generación del DSL de A2UI Express, el lenguaje de descripción de interfaces que utiliza la demo CopilotKit Express. No se trata por tanto de un modelo autónomo, sino de un artefacto de ajuste fino que debe cargarse junto con los pesos base para funcionar.

El adaptador se distribuye en formato `mlx_lm` (Apple MLX), con 342 matrices lógicas y un hash SHA-256 documentado (`778467f51be80c125d41cecfc654f20083013e8602926f2ee1b7d7de910e105b`). Fue entrenado con Unsloth durante 160 pasos sobre 240 conversaciones (las 159 filas de formulario originales más 90 tarjetas informativas), empleando el system prompt de la demo de CopilotKit Express, y alcanzó una pérdida de validación de 0.038.

Su relevancia es muy acotada: es un experimento de ajuste fino orientado a un caso de uso concreto (generación de UI declarativa) y publicado en fase temprana. Según la propia model card, en evaluación offline compila 3 de los 4 prompts de ejemplo de la demo y todavía no se ha exportado para su ejecución en navegador. El repositorio ocupa 0.1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (modelo base Gemma 4 E4B); formato `mlx_lm` |
| Parámetros totales | no disponible (adaptador LoRA de rank 8; el modelo base tiene 4.4B según gemma4.dev) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye sin cuantizar; el base admite cuantización, pero no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con aviso: los pesos Gemma subyacentes mantienen los términos de Google, ver `NOTICE.txt`) |
| Formato de pesos | `mlx_lm` (adaptador LoRA); existe una variante ONNX publicada por el mismo autor |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 8 y escala 2.0 con 342 matrices lógicas, aplicado sobre el modelo base `unsloth/gemma-4-E4B-it` (commit `4e22d7e59e078e63a14f351efdc5232ed366b621`). El ajuste se realizó con Unsloth durante 160 pasos sobre un conjunto de 240 conversaciones: las 159 filas de formulario originales más 90 tarjetas informativas. El entrenamiento utilizó el system prompt de la demo de CopilotKit Express como condicionamiento, de modo que el adaptador está especializado en producir el DSL de A2UI Express en ese contexto concreto.

La pérdida de validación reportada es de 0.038. No se documentan detalles sobre composición del dataset más allá del recuento de conversaciones, ni sobre el uso de RLHF o DPO (no disponible). El adaptador se distribuye en el layout de `mlx_lm`, lo que lo hace apto para inferencia en Apple Silicon mediante MLX; el mismo autor publica una variante ONNX orientada a ejecución en navegador.

## Capacidades

- Generación del DSL de A2UI Express para la demo CopilotKit Express, condicionada por su system prompt.
- Generación de texto y razonamiento heredados del modelo base Gemma 4 E4B (no evaluados de forma específica en este adaptador).
- Capacidad multimodal de entrada heredada del base, según la información pública de Gemma 4 E4B (no verificada en este adaptador).
- Modo de razonamiento (Thinking Mode) del modelo base, según gemma4.dev (no verificado en el adaptador).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de interfaces declarativas en A2UI Express: el adaptador produce el DSL que consume la demo CopilotKit Express a partir de conversaciones con el system prompt adecuado; es su función principal y la única validada por el autor.
- Prototipado de asistentes que construyen UI bajo demanda: integrado en un pipeline con el modelo base, permite convertir instrucciones en lenguaje natural en descripciones de interfaz para demos de agentes.
- Investigación sobre ajuste fino con LoRA y Unsloth: el repositorio documenta hiperparámetros (rank 8, escala 2.0, 160 pasos, 240 conversaciones) y pérdida de validación, lo que lo hace útil como referencia reproducible de un pipeline de especialización.
- Evaluación de despliegue en Apple Silicon: al estar en formato `mlx_lm`, sirve para probar flujos de inferencia local en Mac con MLX antes de exportar a otros formatos.
- Experimentación con exportación a navegador: la variante ONNX del mismo autor permite estudiar el paso de un adaptador MLX a un runtime web, aunque el adaptador LoRA aquí descrito aún no se ha exportado para navegador.
- Docencia y demostraciones de especialización de modelos: su tamaño reducido (0.1 GB de repositorio) y su documentación explícita facilitan explicar cómo un LoRA modifica el comportamiento de un modelo base en un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la pérdida de validación (0.038) y la compilación correcta de 3 de los 4 prompts de ejemplo de la demo en evaluación offline.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base Gemma 4 E4B, que según gemma4.dev requiere un mínimo de 8 GB de VRAM.
- GPU recomendadas: no disponible para el adaptador; el modelo base está descrito como ejecutable en cualquier GPU de consumo moderna.
- Compatibilidad con GPU de consumo: el adaptador está en formato `mlx_lm`, orientado a Apple Silicon; para GPU NVIDIA sería necesario convertir el adaptador o usar la variante ONNX.
- Opciones de despliegue: MLX (`mlx_lm`) para Apple Silicon; ONNX Runtime para la variante publicada por el mismo autor; otros runtimes (vLLM, llama.cpp, Ollama, TGI) no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soverius-ai/gemma-4-E4B-it-A2UI-Express-LoRA | Adaptador LoRA (rank 8) sobre base de 4.4B | no disponible | `mlx_lm` | apache-2.0 (pesos base con términos Gemma) | Hugging Face, 0 descargas |
| soverius-ai/gemma-4-E4B-it-A2UI-Express-ONNX | Mismo ajuste, exportado a ONNX | no disponible | ONNX | no disponible | Hugging Face |
| unsloth/gemma-4-E4B-it (base) | 4.4B | no disponible | safetensors y variantes | términos Gemma de Google | Hugging Face |

No se dispone de información sobre otros adaptadores LoRA comparables para A2UI Express ni sobre métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar los pesos base `unsloth/gemma-4-E4B-it` para funcionar.
- Especialización muy estrecha: está entrenado con el system prompt de la demo CopilotKit Express y solo se ha validado contra sus prompts de ejemplo; su comportamiento fuera de ese contexto no está documentado.
- Cobertura incompleta: según el autor, compila 3 de los 4 prompts de ejemplo de la demo en evaluación offline.
- Sin exportación a navegador: la model card indica que aún no se ha exportado para el navegador (la variante ONNX es un artefacto separado).
- Licencia matizada: el adaptador se declara apache-2.0, pero los pesos Gemma subyacentes mantienen los términos de Google; es necesario revisar `NOTICE.txt` antes de un uso comercial.
- Sin datos de sesgos, alucinación o rendimiento multilingüe: no disponibles en la información proporcionada.
- Madurez temprana: 0 descargas y 0 interacciones en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Contexto máximo no documentado: no se puede garantizar el comportamiento en conversaciones largas.

## Enlaces

- [Hugging Face: soverius-ai/gemma-4-E4B-it-A2UI-Express-LoRA](https://huggingface.co/soverius-ai/gemma-4-E4B-it-A2UI-Express-LoRA)
- [Variante ONNX: soverius-ai/gemma-4-E4B-it-A2UI-Express-ONNX](https://huggingface.co/soverius-ai/gemma-4-E4B-it-A2UI-Express-ONNX)
- [Modelo base: unsloth/gemma-4-E4B-it](https://huggingface.co/unsloth/gemma-4-E4B-it)
- [Ficha de Gemma 4 E4B en gemma4.dev](https://gemma4.dev/models/gemma-4-e4b)
