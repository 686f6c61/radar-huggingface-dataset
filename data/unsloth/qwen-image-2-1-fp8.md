# unsloth/Qwen-Image-2.1-FP8

## Resumen

Qwen-Image-2.1-FP8 es una versión cuantizada del modelo de generación y edición de imágenes Qwen-Image-2.1, publicada por Unsloth. El modelo base lo desarrolla el equipo Qwen (Alibaba), y esta variante aplica cuantización FP8 e INT8 sobre el transformer y sobre el codificador de texto para reducir el consumo de memoria sin renunciar a la calidad de forma significativa. El repositorio incluye además una copia preconvertida a FP8 del codificador de texto Qwen3-VL y un VAE en bf16.

El modelo resuelve dos tareas en un único pipeline: generación de imágenes a partir de texto y edición de imágenes con referencias. Su componente de generación visual tiene 7B de parámetros distribuidos en 32 capas DiT single-stream, lo que lo sitúa en un rango de eficiencia adecuado para inferencia local. La innovación principal es el soporte nativo de transparencia (RGBA), que permite generar y editar capas transparentes y extraer sujetos de fotografías.

La relevancia actual de esta ficha radica en que Unsloth ofrece una alternativa práctica al modelo bf16 original: el transformer pasa de 14,23 GB a 7,12 GB en FP8 o 7,26 GB en INT8, y el codificador de texto de 17,5 GB a 9,39 GB. Con offloading, el modo FP8 dinámico puede ejecutarse con solo 6 GB de VRAM, lo que acerca la generación de imágenes de alta calidad a GPUs de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) single-stream, 32 capas, con atención de granularidad mixta y reutilización de prefix KV cache |
| Parámetros totales | 7B en el componente de generación visual (transformer); el codificador de texto es Qwen3-VL |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de difusión; no se especifica ventana de contexto textual) |
| Tipos de cuantización | FP8 e INT8 (INT8 es el esquema publicado por defecto); también disponible GGUF en repositorio separado |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors (INT8: 7,26 GB; FP8: 7,12 GB; text encoder FP8: 9,39 GB; VAE bf16: 0,63 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 emplea una arquitectura de Diffusion Transformer con 32 capas single-stream y 7B de parámetros en el componente de generación visual. Incorpora atención de granularidad mixta y reutilización de prefix KV cache, dos optimizaciones orientadas a reducir el coste computacional manteniendo la calidad de imagen. El pipeline combina el transformer de difusión con un codificador de texto Qwen3-VL y un VAE, siguiendo el esquema habitual de los modelos texto-a-imagen modernos.

Esta variante de Unsloth no reentrena el modelo: aplica cuantización post-entrenamiento sobre los pesos bf16 originales. Según la model card, la fidelidad respecto al modelo bf16 medida con LPIPS a misma semilla es de 0,064 para INT8 y 0,112 para FP8 (menor es mejor), lo que indica que INT8 es el esquema con menor degradación y por eso se distribuye como opción por defecto. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con calidad fotorrealista.
- Generación nativa de imágenes con transparencia (RGBA) desde texto.
- Edición de imágenes con hasta 10 imágenes de referencia.
- Edición local mediante círculos, anotaciones pintadas o máscaras separadas.
- Preservación de identidad de personas y productos en tareas de edición.
- Extracción de sujetos a partir de fotografías (subject extraction).
- Edición de capas transparentes.
- Tipografía mejorada, iluminación de retratos y detalle fino en texturas.
- Soporte multilingüe de prompts en inglés y chino.
- Integración con la librería diffusers mediante `QwenImage21Pipeline`.

## Casos de uso

- Generación de material gráfico para marketing: el modelo produce imágenes fotorrealistas a partir de descripciones textuales, adecuado para banners, ilustraciones editoriales y creatividades que requieran calidad fotográfica sin sesión de fotos.
- Diseño de assets con transparencia: la generación nativa RGBA permite crear logos, recortes y elementos de interfaz con fondo transparente directamente, sin postprocesado de máscaras.
- Edición de producto en e-commerce: con hasta 10 imágenes de referencia y preservación de identidad, se pueden sustituir fondos, cambiar iluminación o insertar productos en escenas nuevas manteniendo su apariencia.
- Extracción de sujetos para catálogos: a partir de fotografías existentes, el modelo aísla al sujeto y genera una capa transparente reutilizable en otros materiales.
- Edición localizada en flujos de retoque: las máscaras y anotaciones permiten modificar regiones concretas de una imagen sin regenerar el resto, útil en estudios de diseño y agencias.
- Prototipado rápido en GPUs de consumo: con el modo FP8 dinámico y offloading se puede ejecutar con 6 GB de VRAM, lo que facilita pruebas locales en estaciones de trabajo sin GPU de datacenter.
- Integración en pipelines de diffusers: al cargarse con `QwenImage21Pipeline`, encaja en herramientas existentes de generación por lotes y automatización creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de generación de imágenes. El único dato cuantitativo de calidad publicado es la fidelidad respecto al modelo bf16 medida con LPIPS a misma semilla:

| Esquema | LPIPS vs bf16 (menor es mejor) | Tamaño del transformer |
|---|---|---|
| INT8 | 0,064 | 7,26 GB |
| FP8 | 0,112 | 7,12 GB |
| bf16 (referencia) | 0 | 14,23 GB |

## Requisitos de hardware

- VRAM estimada: el transformer cuantizado ocupa 7,12 GB (FP8) o 7,26 GB (INT8); el codificador de texto FP8 ocupa 9,39 GB y el VAE bf16 0,63 GB. La suma de componentes supera los 17 GB si se cargan todos simultáneamente en VRAM.
- Modo FP8 dinámico con offloading: puede ejecutarse con solo 6 GB de VRAM, con una penalización de velocidad de menos de 2x según la model card.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por los tamaños indicados, una GPU de 24 GB (RTX 4090, A10G) permite cargar transformer y text encoder cuantizados con margen; GPUs de 16 GB requieren offloading parcial.
- ¿Cabe en GPU de consumo? Sí, con cuantización y offloading; el modo FP8 dinámico está pensado para 6 GB de VRAM.
- Opciones de despliegue: diffusers (requiere build main, ya que el soporte de Qwen-Image-2.1 es posterior a la release 0.40), Unsloth Desktop (selección automática de precisión INT8/FP8) y llama.cpp/GGUF mediante el repositorio `unsloth/Qwen-Image-2.1-GGUF`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros (generación) | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-FP8 (esta ficha) | 7B | No disponible | qwen-research | safetensors FP8/INT8 | Cuantizado por Unsloth, RGBA nativo, hasta 10 referencias |
| Qwen-Image-2.1 (bf16) | 7B | No disponible | qwen-research | safetensors bf16 | Modelo original; transformer de 14,23 GB y text encoder de 17,5 GB |
| Qwen-Image-2.1-GGUF | 7B | No disponible | qwen-research | GGUF | Variante para llama.cpp publicada por Unsloth |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otros modelos de generación de imágenes de la competencia.

## Limitaciones y advertencias

- Licencia qwen-research: no es una licencia permisiva estándar; es necesario revisar los términos del enlace de licencia del modelo base antes de cualquier uso comercial.
- Idiomas limitados a inglés y chino; no se garantiza calidad con prompts en castellano u otros idiomas.
- El modelo es de difusión: no dispone de ventana de contexto textual ni de razonamiento multi-turno, por lo que no debe evaluarse con benchmarks de lenguaje.
- La cuantización introduce degradación medible: LPIPS de 0,064 en INT8 y 0,112 en FP8 frente a bf16; para máxima fidelidad debe usarse el modelo bf16 original.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir detalles inconsistentes con el prompt, especialmente en tipografía y anatomía.
- Requiere una build main de diffusers; las versiones estables anteriores a 0.40 no soportan Qwen-Image-2.1.
- El repositorio ocupa 41,1 GB en total, lo que exige espacio de almacenamiento considerable aunque solo se descarguen algunos archivos.
- No se detallan sesgos específicos del dataset de entrenamiento en la información disponible.

## Enlaces

- Hugging Face (esta versión): https://huggingface.co/unsloth/Qwen-Image-2.1-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GGUF: https://huggingface.co/unsloth/Qwen-Image-2.1-GGUF
- Guía de Unsloth para Qwen-Image-2.1: https://unsloth.ai/docs/models/qwen-image-2.1
- GitHub de Unsloth: https://github.com/unslothai/unsloth
- Documentación de Unsloth Desktop: https://unsloth.ai/docs/desktop
- Web de Unsloth: https://unsloth.ai/
- GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Blog de Qwen: https://qwen.ai/blog?id=qwen-image-2.1
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1
- Discord de Qwen: https://discord.gg/BEYSk3pkSu
- Discord de Unsloth: https://discord.gg/unsloth
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
