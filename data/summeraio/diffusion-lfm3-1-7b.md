# summerAIO/Diffusion-LFM3-1.7B

## Resumen

Diffusion-LFM3-1.7B es un modelo de lenguaje experimental de tipo block-diffusion, un fine-tune del modelo base LiquidAI/LFM3-1.7B-Base de Liquid AI, publicado por el usuario summerAIO. En lugar de generar tokens estrictamente de izquierda a derecha, el modelo produce el texto bloque a bloque (longitud de bloque 32): cada bloque se genera de forma autorregresiva y los tokens dentro del bloque se obtienen mediante denoising iterativo de difusión enmascarada con decodificación paralela por umbral de confianza. Esta aproximación híbrida busca combinar la coherencia global de la generación autorregresiva con el paralelismo de la difusión.

El modelo cuenta con 1.722.727.168 parámetros reales (según los pesos en safetensors) y un repositorio de 6,9 GB. Se entrenó durante solo 377 pasos de optimización sobre el subconjunto sample-10BT de HuggingFaceFW/fineweb-edu, con longitud de bloque 32 y contexto de hasta 15 bloques. El propio autor lo describe como una research preview no apta para producción, con salidas que pueden contener palabras repetidas, palabras truncadas y errores factuales.

Es relevante ahora como ejemplo práctico de adaptación de un transformer causal existente a un paradigma de difusión de bloques, un área de investigación activa que persigue acelerar la inferencia manteniendo la calidad del texto. No obstante, su estado experimental, la ausencia de benchmarks publicados y su licencia restrictiva lo sitúan en el terreno de la exploración más que del despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer adaptado a block-diffusion (masked-diffusion dentro de bloque, autorregresiva entre bloques); atención block-causal y convoluciones centradas aplicadas en tiempo de carga |
| Parametros totales | 1.722.727.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 15 bloques de 32 tokens (480 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no se declara lista de idiomas; el dataset de entrenamiento es fineweb-edu, mayoritariamente inglés) |
| Licencia | LFM Open License v1.0 (uso comercial solo para entidades con ingresos anuales inferiores a 10 M USD) |
| Formato de pesos | safetensors (con custom_code y script de inferencia `blockdiff_inference.py`) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B-Base, un transformer causal de 1,7 B de parámetros, y lo modifica para operar con un objetivo de difusión de bloques. Se añadió el token especial `<|mdm_mask|>` y se redimensionaron los embeddings atados. Todos los pesos se afinaron con un objetivo block-diffusion: bloques de contexto limpios más un bloque ruidoso, entropía cruzada ponderada por 1/t, enmascaramiento complementario y un desplazamiento de logits estilo Dream. El entrenamiento usó bloques de longitud 32, contexto de hasta 15 bloques, learning rate 2e-5, optimizador AdamW, precisión bf16 y solo 377 pasos de optimización sobre fineweb-edu (sample-10BT).

Una innovación técnica destacable es que la adaptación no requiere reentrenar la arquitectura de atención desde cero: en tiempo de carga, `blockdiff_inference.py` parchea la máscara de atención a block-causal (bidireccional dentro de un bloque, causal entre bloques; las capas de ventana deslizante mantienen una ventana simétrica) y sustituye las convoluciones cortas causales por convoluciones centradas. Los ficheros de modelado originales se incluyen sin modificar. La decodificación paralela se controla con el parámetro `tau`: valores bajos generan más tokens por pasada (más rápido), valores altos priorizan calidad.

## Capacidades

- Generación de texto conversacional y continuaciones de texto libre, heredadas del modelo base.
- Generación paralela intra-bloque mediante difusión enmascarada con umbral de confianza configurable (`tau`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles de forma explícita; el entrenamiento se realizó sobre fineweb-edu, de predominio inglés.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).
- Requiere un script de inferencia específico (`blockdiff_inference.py`); no funciona correctamente con `generate()` estándar.

## Casos de uso

- Investigación en modelos de difusión de lenguaje: sirve como banco de pruebas para estudiar decodificación paralela por bloques y comparar la calidad frente a la generación autorregresiva clásica sobre una base de 1,7 B de parámetros.
- Experimentos de aceleración de inferencia: el parámetro `tau` permite explorar el compromiso entre velocidad y calidad, útil para medir cuántos tokens por pasada se pueden generar sin degradar la salida.
- Prototipado de continuaciones de texto cortas: con un contexto máximo de 480 tokens, encaja en tareas de autocompletado o generación de frases breves en entornos de laboratorio.
- Reproducción de investigación: al incluir los ficheros de modelado originales sin modificar y un script de inferencia autocontenido, facilita la replicación de experimentos de block-diffusion sobre un transformer existente.
- Docencia y formación técnica: ejemplo didáctico de cómo adaptar un modelo causal a un paradigma de difusión mediante parcheo de atención y convoluciones en tiempo de carga.
- Evaluación comparativa de licencias y despliegue: útil para estudiar las implicaciones de la LFM Open License v1.0 en proyectos derivados de modelos de Liquid AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,72 B de parámetros en bf16, los pesos ocupan aproximadamente 3,4 GB; sumando activaciones y caché de contexto (480 tokens), se estima un consumo de 4-6 GB en bf16. En cuantizaciones de 8 bits o 4 bits (no documentadas por el autor) bajaría a unos 2-3 GB, pero no hay soporte oficial para ellas.
- GPU recomendadas: una GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) debería ser suficiente para bf16; para mayor throughput, A10G, L4 o A100.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM para bf16.
- Opciones de despliegue: el autor solo proporciona `blockdiff_inference.py` con `transformers>=5.12`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el propio autor advierte que `generate()` estándar no funciona correctamente.
- Latencia y throughput: no disponibles; dependen fuertemente del valor de `tau` y no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Diffusion-LFM3-1.7B | 1,72 B | 480 tokens (15 bloques) | Block-diffusion (fine-tune) | LFM Open License v1.0 (comercial < 10 M USD) | Hugging Face, research preview |
| LiquidAI/LFM3-1.7B-Base | 1,7 B (aprox.) | no disponible en la informacion | Transformer causal | LFM Open License v1.0 | Hugging Face |
| Modelos de difusión de lenguaje de referencia (p. ej. Dream, LLaDA) | no disponible en la informacion | no disponible en la informacion | Masked-diffusion | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental entrenado solo 377 pasos de optimización; el autor advierte de palabras repetidas, palabras truncadas y errores factuales.
- No apto para producción según el propio autor (research preview).
- Contexto muy limitado: 480 tokens (15 bloques de 32), insuficiente para conversaciones largas o documentos.
- Riesgo elevado de alucinación por el escaso entrenamiento y el dataset limitado (fineweb-edu sample-10BT).
- Idiomas no declarados; el entrenamiento sobre fineweb-edu sugiere predominio del inglés, con posible bajo rendimiento en castellano.
- No funciona con `generate()` estándar; requiere el script `blockdiff_inference.py` y `transformers>=5.12`, lo que limita la integración con herramientas habituales.
- Licencia LFM Open License v1.0: uso comercial solo permitido a entidades con ingresos anuales inferiores a 10 M USD; la redistribución exige incluir la licencia, mantener atribuciones y declarar modificaciones.
- El proyecto no está afiliado ni respaldado por Liquid AI; "LFM" y "Liquid AI" se usan solo para identificar el origen del modelo base.
- Sin benchmarks publicados, no es posible evaluar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerAIO/Diffusion-LFM3-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Script de inferencia: `blockdiff_inference.py` (incluido en el repositorio del modelo)
- Licencia: `LICENSE` y `NOTICE` en el repositorio del modelo
