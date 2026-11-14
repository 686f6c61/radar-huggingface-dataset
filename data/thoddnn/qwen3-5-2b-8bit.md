# thoddnn/Qwen3.5-2B-8bit

## Resumen

Qwen3.5-2B-8bit es una conversión al formato MLX del modelo Qwen3.5-2B, publicada por el usuario thoddnn. El modelo original lo desarrolla el equipo Qwen de Alibaba, y esta variante concreta es una cuantización a 8 bits pensada para ejecución eficiente en hardware Apple Silicon a través de la librería `mlx-vlm`. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta imágenes y texto como entrada y genera texto como salida.

El modelo base, Qwen3.5-2B-Base, pertenece a la familia Qwen3.5 y cuenta con aproximadamente 2.213 millones de parámetros totales (2,2B), lo que lo sitúa en la gama de modelos pequeños capaces de ejecutarse en hardware de consumo. La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo multimodal compacto en Macs con chip de la serie M, manteniendo la licencia permisiva Apache 2.0 del modelo original.

Conviene señalar que el repositorio tiene un carácter marcadamente técnico y escueto: la model card se limita a documentar el proceso de conversión con `mlx-vlm` versión 0.3.12 y a ofrecer un ejemplo de uso por línea de comandos. No se aportan datos sobre composición del dataset de entrenamiento, benchmarks ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 2.213.241.664 (aprox. 2,2B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits (esta variante); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Libreria | transformers / mlx-vlm |
| Tamano del repositorio | 2,7 GB |
| Modelo base | Qwen/Qwen3.5-2B-Base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-2B-Base más allá de su naturaleza multimodal (procesa imagen y texto). No se especifica si emplea atención lineal, mezcla de expertos, estado espacio-temporal (SSM) o un transformer denso convencional, ni se documentan innovaciones como decodificación especulativa o modos de razonamiento extendido.

Respecto al entrenamiento, no se han publicado en la información proporcionada datos sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. Esta variante concreta es únicamente una conversión de pesos a 8 bits mediante `mlx-vlm` 0.3.12, por lo que no introduce cambios en el entrenamiento respecto al modelo original.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y tareas de comprensión multimodal.
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Ejecución en hardware Apple Silicon mediante MLX, con soporte de generación por línea de comandos a través de `mlx_vlm.generate`.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades de tool calling, function calling, agentes o razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües específicas: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Descripción automática de imágenes en local: el modelo puede generar descripciones textuales de fotografías o capturas ejecutándose íntegramente en un Mac con chip M, sin depender de servicios en la nube, gracias a su formato MLX de 8 bits.
- Asistente visual para accesibilidad: integrado en una aplicación de escritorio, podría leer y describir el contenido de imágenes al usuario, aprovechando su naturaleza image-text-to-text y su reducido tamaño (2,2B parámetros).
- Prototipado rápido de aplicaciones multimodales: desarrolladores que trabajen en macOS pueden validar flujos de visión-lenguaje con `mlx-vlm` antes de migrar a infraestructura de producción, dado el bajo coste de despliegue del modelo cuantizado.
- Extracción de información de documentos escaneados: el modelo podría procesar imágenes de facturas o formularios y devolver texto estructurado, siempre que se valide su precisión en tareas de OCR, no documentada en la información disponible.
- Clasificación y etiquetado de imágenes en pipelines de datos: con temperatura 0.0 (como en el ejemplo de la model card) puede emplearse para generar etiquetas deterministas sobre lotes de imágenes en tareas de curación de datasets.
- Educación y demos interactivas: su tamaño compacto y licencia Apache 2.0 permiten incluirlo en talleres o entornos de aprendizaje donde se enseñe inferencia multimodal local en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 2,7 GB en formato de 8 bits; se recomienda al menos 4-6 GB de memoria unificada libre para la inferencia con overhead de la librería.
- Hardware objetivo: Apple Silicon (chips de la serie M) mediante MLX; no está pensado para GPU NVIDIA en esta variante concreta.
- Cabe en hardware de consumo: sí, en Macs con memoria unificada de 8 GB o superior, aunque se recomienda 16 GB para mayor holgura.
- Opciones de despliegue: `mlx-vlm` (documentado en la model card); otros frameworks como vLLM, llama.cpp, Ollama o TGI no están documentados para esta variante MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-8bit (esta ficha) | 2,2B | No disponible | Apache 2.0 | MLX safetensors 8-bit | Variante MLX para Apple Silicon |
| Qwen/Qwen3.5-2B-Base | 2,2B | No disponible | Apache 2.0 | safetensors | Modelo base original, sin cuantizar |
| Otras variantes Qwen3.5-2B | 2,2B | No disponible | Apache 2.0 | No disponible | No se dispone de datos comparativos de rendimiento |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- La model card es extremadamente escueta y no documenta sesgos, tasas de alucinación ni evaluación de calidad; cualquier uso en producción requiere validación propia.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- La longitud de contexto no está documentada, lo que impide planificar casos de uso con entradas largas.
- Al ser una cuantización a 8 bits, puede existir una degradación de precisión respecto al modelo base original, no cuantificada en la información disponible.
- La variante está orientada a MLX y Apple Silicon; no es directamente desplegable en GPU NVIDIA sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base original para confirmar condiciones.
- Riesgo de alucinación inherente a los modelos generativos: no hay evaluación publicada que lo cuantifique.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thoddnn/Qwen3.5-2B-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Modelo original referenciado en la model card: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
