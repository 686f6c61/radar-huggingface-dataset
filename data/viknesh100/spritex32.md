# viknesh100/SpriteX32

## Resumen

SpriteX32 es un modelo de texto a imagen de pequeno tamano especializado en la generacion de sprites de pixel art de 32x32 pixeles a partir de prompts en ingles. Lo desarrolla el usuario viknesh100 y se publica en Hugging Face bajo licencia "other". Con solo 11,4 millones de parametros, es un modelo de investigacion y aficionado disenado para ejecutarse comodamente en CPU o en una GPU de gama baja, lo que lo convierte en un caso de estudio interesante sobre modelos generativos minimos.

Tecnicamente es una U-Net condicional entrenada con flow matching (prediccion de velocidad sobre una trayectoria lineal de ruido a imagen) y guiado por embeddings de texto de CLIP. El muestreo se realiza con un integrador Euler y classifier-free guidance. Su resolucion nativa es fija de 32x32 pixeles en RGB, sin canal alfa.

Su relevancia actual es limitada en terminos de capacidades, pero resulta util como referencia educativa: demuestra como un modelo de apenas 11 millones de parametros puede aprender una distribucion visual muy restringida (sprites de videojuegos) con un dataset pequeno de 12.830 pares imagen-texto y un unico GPU de Google Colab. No compite con modelos de difusion de gran escala ni pretende hacerlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con bloques residuales, self-attention en la resolucion mas baja, condicionamiento temporal y de texto |
| Parametros totales | 11.405.827 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el texto se reduce a un unico vector CLIP agrupado) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precision original) |
| Idiomas soportados | ingles (en) |
| Licencia | other |
| Formato de pesos | safetensors (model.safetensors, pesos EMA) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net condicional con bloques residuales, atencion propia en la resolucion mas baja y modulacion por tiempo y texto. El codificador de texto es `openai/clip-vit-base-patch32`, congelado y cargado por separado en inferencia; el prompt se reduce a un unico embedding CLIP agrupado (pooled), lo que limita severamente la comprension de prompts composicionales o detallados. El objetivo de entrenamiento es flow matching: se aprende un campo de velocidad sobre una trayectoria lineal entre ruido e imagen. El muestreo usa Euler con classifier-free guidance.

El entrenamiento se realizo sobre el dataset `tkarr/sprite_caption_dataset`, con 12.830 pares imagen-caption. Las imagenes se convirtieron a RGBA, se compusieron sobre fondo blanco, se redimensionaron a 32x32 y se escalaron al rango [-1, 1]. La optimizacion uso AdamW con tasa de aprendizaje 2e-4 y decaimiento coseno, tamano de lote 128, 15.000 pasos y recorte de gradiente en 1.0. Durante el entrenamiento se descarto la condicion de texto en el 15 % de las muestras para habilitar classifier-free guidance. Se aplico EMA con decaimiento 0.999 y se liberaron los pesos EMA. Todo el entrenamiento se ejecuto en un unico GPU de Google Colab.

## Capacidades

- Generacion de imagenes de texto a imagen en resolucion fija de 32x32 pixeles RGB.
- Especializacion en sprites de pixel art: espadas, monstruos, magos y objetos simples.
- Generacion por lotes de varias imagenes por prompt (`num_images`).
- Control de reproducibilidad mediante semilla (`seed`).
- Escalado por vecino mas cercano a resoluciones superiores (p. ej. 128) sin generacion nativa a esa resolucion.
- Ajuste del seguimiento del prompt mediante `guidance_scale` (rango recomendado 1.5-6).
- Ajuste del numero de pasos de Euler (rango razonable 20-100).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento.
- Capacidad multilingue practicamente inexistente: solo se entreno con captions en ingles.

## Casos de uso

- Prototipado rapido de sprites para videojuegos: generar variantes de un objeto (p. ej. "a red sword") con distintas semillas para elegir un diseno base antes de retocarlo manualmente en un editor de pixel art.
- Generacion de assets para game jams: producir lotes de sprites de 32x32 en minutos en una CPU, sin necesidad de GPU dedicada, para prototipos jugables.
- Estudio educativo de modelos de difusion y flow matching: el modelo es lo bastante pequeno (11,4 M de parametros) para inspeccionar la U-Net, el sampler Euler y el condicionamiento CLIP en un cuaderno de Colab.
- Base para fine-tuning: punto de partida para adaptar la generacion de sprites a un estilo o conjunto de clases concreto con un dataset propio pequeno.
- Generacion de iconos minimalistas: crear iconos de 32x32 para interfaces retro o demos, aprovechando el escalado por vecino mas cercano para mantener la estetica pixelada.
- Pruebas de pipelines de inferencia: validar integraciones de `huggingface_hub`, `safetensors` y PyTorch en entornos con recursos muy limitados.
- Investigacion sobre limitaciones de condicionamiento CLIP agrupado: analizar como un unico vector de texto restringe la composicionalidad y el control fino del prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion fue unicamente cualitativa y que no se calcularon metricas cuantitativas como FID.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 11,4 M de parametros, el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos unos pocos cientos de MB de VRAM libre; el autor indica que funciona comodamente en CPU o en una GPU pequena.
- Cabe en GPU consumer: si, en practicamente todas (incluidas GTX 1050, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: el repositorio incluye un pipeline propio (`SpriteFlowPipeline`) y un script `inference.py`; se usa con PyTorch, `transformers`, `safetensors`, `huggingface_hub` y `pillow`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el muestreo por defecto es de 50 pasos Euler.

## Comparativa con modelos similares

No se dispone de datos de rendimiento cuantitativos ni de alternativas directamente comparables en la informacion proporcionada. A continuacion se ofrece una comparacion estructural basica con modelos de texto a imagen de referencia, sin datos de benchmarks:

| Modelo | Parametros | Resolucion nativa | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpriteX32 | 11,4 M | 32x32 | vector CLIP agrupado | other | Hugging Face |
| Stable Diffusion 1.5 | ~860 M (U-Net) | 512x512 | tokens CLIP (77) | CreativeML OpenRAIL-M | Hugging Face |
| SDXL | ~2,6 B (U-Net) | 1024x1024 | tokens CLIP (77) x2 | CreativeML OpenRAIL++-M | Hugging Face |
| PixArt-alpha | ~600 M | 512x512 | tokens T5 | OpenRAIL++ | Hugging Face |

La comparacion es meramente estructural: SpriteX32 opera en un regimen de resolucion y escala dos ordenes de magnitud por debajo de los modelos de difusion generalistas y no es directamente sustituible por ellos para tareas generales.

## Limitaciones y advertencias

- Resolucion fija de 32x32: el modelo no puede generar imagenes mayores de forma nativa; el escalado es por vecino mas cercano.
- Comprension de prompts muy limitada: al reducir el texto a un unico vector CLIP agrupado, los colores y tipos de objeto amplios funcionan mucho mejor que prompts detallados o composicionales.
- Dataset pequeno (12.830 pares): cobertura limitada de sujetos y estilos; la calidad de los captions no fue auditada.
- Sin canal alfa: las salidas son RGB sobre fondo claro; no genera transparencia.
- Evaluacion solo cualitativa: no hay metricas como FID, por lo que el rendimiento real no esta cuantificado.
- Riesgo de alucinacion visual: al ser un modelo generativo, puede producir sprites incoherentes o fuera de distribucion, especialmente con prompts alejados del dataset.
- Sesgos: no documentados, pero el dataset de entrenamiento no fue auditado y puede contener sesgos de estilo o de representacion.
- Licencia "other": es necesario revisar los terminos exactos antes de cualquier uso comercial; ademas, el dataset de entrenamiento (`tkarr/sprite_caption_dataset`) tiene sus propios terminos que deben consultarse.
- El codificador CLIP (`openai/clip-vit-base-patch32`) es un modelo separado de OpenAI bajo licencia MIT que se descarga en tiempo de inferencia.
- Uso previsto limitado a aficion, investigacion y educacion; no recomendado para produccion sin validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/viknesh100/SpriteX32
- Dataset de entrenamiento: https://huggingface.co/datasets/tkarr/sprite_caption_dataset
- Codificador de texto CLIP: https://huggingface.co/openai/clip-vit-base-patch32
