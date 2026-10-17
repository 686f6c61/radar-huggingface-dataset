# SushmaMaddali/data266-pokemon-sd15-lora-r8

## Resumen

Este repositorio contiene un adaptador LoRA de rango 8 para Stable Diffusion 1.5, no un modelo completo. Lo publica SushmaMaddali (Sai Sushma M) y su objetivo es ajustar la UNet de SD 1.5 al dataset `reach-vb/pokemon-blip-captions` para generar imágenes de estilo Pokémon en el marco de un trabajo académico no comercial. El adaptador se entrena sobre 749 imágenes, con 1.500 pasos, batch 2, tasa de aprendizaje 0,0001, precisión BF16 y semilla 266; el repositorio ocupa 0,0 GB y requiere cargar el modelo base para la inferencia.

Su relevancia es acotada: sirve como ejemplo reproducible de adaptación de bajo rango sobre un modelo de difusión pequeño y como material de coursework, no como un modelo de producción. La licencia es `other` y restringe el uso a fines académicos y de investigación no comerciales, además de exigir el cumplimiento de las licencias de SD 1.5 y del dataset. No se han publicado benchmarks ni especificaciones de idiomas, y la model card advierte de composición débil y de que puede generar conceptos amplios de Pokémon en lugar del personaje exacto solicitado. En el momento de la consulta, la página registra 4 descargas y 0 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre la UNet de Stable Diffusion 1.5 (modelo de difusión texto-a-imagen) |
| Parámetros totales | No disponible; el repositorio contiene un adaptador LoRA, no los pesos completos del modelo base |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (texto-a-imagen); no se especifica el límite de tokens del text encoder |
| Tipos de cuantización | No disponible; no se documentan variantes cuantizadas del adaptador. El entrenamiento usó BF16 |
| Idiomas soportados | No disponibles |
| Licencia | Other; uso solo no comercial para coursework académico e investigación; sujeto a las licencias de Stable Diffusion 1.5 y del dataset |
| Formato de pesos | No disponible; adaptador para la librería diffusers |
| Modelo base | `stable-diffusion-v1-5/stable-diffusion-v1-5` |
| Rango LoRA | 8 |
| Dataset de entrenamiento | `reach-vb/pokemon-blip-captions` (749 imágenes) |
| Pasos de entrenamiento | 1.500 |
| Tasa de aprendizaje | 0,0001 |
| Tamaño de batch | 2 |
| Precisión de entrenamiento | BF16 |
| Semilla | 266 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 8 sobre la UNet de Stable Diffusion 1.5. La model card indica que se ajusta la UNet, no el text encoder, y que el entrenamiento usa 749 imágenes del dataset `reach-vb/pokemon-blip-captions`, con 1.500 pasos, batch 2, tasa de aprendizaje 0,0001, precisión BF16 y semilla 266. No se documentan técnicas de RLHF, DPO, decodificación especulativa ni otras innovaciones de arquitectura.

No se detalla la composición completa del dataset más allá del número de imágenes y de que las captions provienen de BLIP. Tampoco se aportan métricas de entrenamiento, curvas de pérdida o evaluaciones cuantitativas. El resultado es un adaptador de bajo rango pensado para modificar el estilo y los conceptos aprendidos por SD 1.5 en un dominio muy concreto, con un coste de almacenamiento mínimo.

## Capacidades

- Generación de imágenes texto-a-imagen con una estética Pokémon aprendida del dataset de entrenamiento.
- Adaptador de bajo rango que modifica la UNet de SD 1.5; no funciona de forma autónoma sin el modelo base.
- Integración con la librería `diffusers`, declarada como librería del repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni evaluación de prompts en distintos idiomas.
- No tiene visión de entrada, audio ni modo thinking.
- El safety checker de SD 1.5 se mantuvo activo durante la evaluación.

## Casos de uso

- Docencia de fine-tuning: cargar el adaptador en `diffusers` y pedir al alumnado que inspeccione el efecto del rango 8 con la semilla 266. Es adecuado porque los hiperparámetros están documentados y el coste de almacenamiento es mínimo.
- Investigación en adaptación eficiente: comparar este LoRA r8 con el r32 de la misma autora sobre el mismo modelo base y dataset. Permite estudiar el compromiso entre capacidad y sobreajuste con 749 imágenes.
- Evaluación cualitativa de adherencia al prompt: ejecutar una batería fija de prompts y anotar omisiones de atributos o composición débil. La model card ya advierte de estas limitaciones y el adaptador sirve para medirlas.
- Generación de material ilustrativo no comercial para trabajos académicos: crear figuras o diapositivas de estilo Pokémon para un informe de curso, siempre que se respete la restricción no comercial y la propiedad intelectual.
- Reproducción de experimentos: reentrenar o reevaluar con los datos declarados (749 imágenes, 1.500 pasos, batch 2, BF16, semilla 266) para comprobar la variabilidad del adaptador.
- Pruebas de integración de pipelines `diffusers`: verificar la carga del LoRA, el uso del safety checker y la inferencia por lotes en un entorno de laboratorio. El adaptador es pequeño y no requiere pesos completos adicionales más allá de SD 1.5.
- Análisis de sesgos y cobertura del dataset: estudiar qué personajes, estilos y composiciones aparecen con 749 imágenes y un rango bajo. Es útil para documentar limitaciones antes de plantear cualquier extensión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se aportan métricas como FID, CLIP score, precisión de atributos o evaluaciones humanas, ni comparaciones cuantitativas con otros LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador no incluye los pesos de SD 1.5; la memoria necesaria la determina el pipeline del modelo base, no el LoRA.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU consumer: no confirmada. Al ser un LoRA de SD 1.5, el límite práctico depende del modelo base y de la resolución, pero no se aportan medidas.
- Despliegue: `diffusers` es la librería declarada. No se documentan vLLM, llama.cpp, Ollama o TGI; no son opciones confirmadas para este adaptador.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 0,0 GB según Hugging Face; el peso real del modelo base debe sumarse aparte.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-pokemon-sd15-lora-r8 | LoRA rango 8 sobre SD 1.5 | No aplica | No disponible | Other; no comercial académico | Hugging Face |
| data266-pokemon-sd15-lora-r32 | LoRA rango 32 sobre SD 1.5, según la página enlazada | No aplica | No disponible | Other (no detallada) | Hugging Face |
| Stable Diffusion 1.5 | Modelo base completo; parámetros no disponibles en la información | No aplica | No disponible | Licencia de SD 1.5 (no detallada aquí) | Hugging Face |

No se han identificado otros adaptadores concretos comparables en la búsqueda. Civitai lista 4.251 modelos con la etiqueta Pokemon, pero sin datos técnicos comparables en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta una evaluación de sesgos. El dataset de 749 imágenes de Pokémon puede sobrerrepresentar estilos, personajes y composiciones concretas.
- Riesgo de alucinación: no aplica igual que en un LLM; el riesgo es generar artefactos visuales, atributos incorrectos o personajes que no coinciden con la petición.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni evaluación de prompts en castellano. El adaptador solo modifica la UNet, no el text encoder.
- Restricciones de licencia: licencia `other`; el autor limita el uso a coursework académico e investigación no comercial. Prohíbe uso comercial, suplantación y producción. Hay que cumplir también las licencias de SD 1.5 y del dataset.
- Propiedad intelectual: Pokémon y sus ilustraciones están protegidos por copyright; la generación no concede derechos sobre personajes.
- Calidad: con 749 imágenes y rango 8 puede haber sobreajuste o capacidad limitada. La model card advierte de composición débil y de conceptos amplios en lugar del personaje exacto.
- Safety checker: se mantuvo activo en la evaluación, pero no garantiza que todas las salidas sean seguras.
- Producción: el autor indica explícitamente que no debe usarse en producción.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/SushmaMaddali/data266-pokemon-sd15-lora-r8
- Variante rango 32: https://huggingface.co/SushmaMaddali/data266-pokemon-sd15-lora-r32
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset referenciado: `reach-vb/pokemon-blip-captions` (identificador; no se incluye URL directa en la información)
- Perfil del autor: https://huggingface.co/SushmaMaddali
- Repositorio del laboratorio: https://github.com/sai-sushma-maddali/data266-lab1/tree/main/
- Registro en free2aitools: https://free2aitools.com/model/sushmamaddali/data266-pokemon-sd15-lora-r8
- Etiqueta Pokemon en Civitai: https://civitai.com/tag/pokemon
- No se han encontrado papers, blogs técnicos o demos adicionales en la búsqueda web.
