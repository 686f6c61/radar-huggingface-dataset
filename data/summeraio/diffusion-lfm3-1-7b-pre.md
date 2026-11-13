# summerAIO/Diffusion-LFM3-1.7B-pre

## Resumen

Diffusion-LFM3-1.7B-pre es un modelo de lenguaje experimental que aplica un objetivo de difusión por bloques (block-diffusion) sobre el modelo base LiquidAI/LFM3-1.7B-Base de Liquid AI. Lo desarrolla el usuario summerAIO y se publica como una research preview el 12 de noviembre de 2026. El modelo combina generación autorregresiva a nivel de bloque con denoising por difusión enmascarada dentro de cada bloque, un enfoque híbrido que busca acelerar la decodificación generando varios tokens por paso hacia delante en lugar de uno solo.

El modelo conserva la arquitectura del LFM3 base (transformer con capas de atención de ventana deslizante y convoluciones cortas) y cuenta con 1.722.727.168 parámetros totales en formato safetensors. El contexto de entrenamiento se limita a 15 bloques de 32 tokens, es decir, 480 tokens efectivos, lo que lo sitúa muy por debajo de los estándares actuales de ventana de contexto.

Su relevancia es fundamentalmente investigadora: demuestra que es posible adaptar un transformer causal preentrenado a un paradigma de difusión por bloques con un ajuste fino relativamente corto (377 pasos de optimizador). No obstante, el propio autor advierte de que no es apto para producción: los resultados pueden contener palabras repetidas, palabras truncadas y errores factuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM3 base) adaptado a block-diffusion con atención block-causal |
| Parametros totales | 1.722.727.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 15 bloques de 32 tokens (480 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (repo de 6,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B-Base y se modifica para generar texto bloque a bloque: los bloques se producen de forma autorregresiva y los tokens dentro de cada bloque se generan mediante denoising iterativo de difusión enmascarada con decodificación paralela por umbral de confianza. En tiempo de carga, el script `blockdiff_inference.py` parchea la máscara de atención a block-causal (bidireccional dentro del bloque, causal entre bloques; las capas de ventana deslizante mantienen una ventana simétrica) y sustituye las convoluciones cortas causales por convoluciones centradas.

El ajuste fino se realizó sobre el subconjunto `sample-10BT` de HuggingFaceFW/fineweb-edu, con longitud de bloque 32, contexto de hasta 15 bloques, tasa de aprendizaje 2e-05, optimizador AdamW y precisión bf16, durante 377 pasos de optimizador. Se añadió el token especial `<|mdm_mask|>` y se redimensionaron los embeddings atados. El objetivo de entrenamiento combina bloques de contexto limpios con un bloque ruidoso, entropía cruzada ponderada por 1/t, enmascaramiento complementario y un desplazamiento de logits estilo Dream.

## Capacidades

- Generación de texto conversacional mediante decodificación por difusión por bloques.
- Decodificación paralela controlada por el parámetro `tau`: valores bajos generan más tokens por paso (más rápido), valores altos priorizan calidad.
- Herencia de las capacidades del LFM3-1.7B-Base (generación de texto general), aunque degradadas por el ajuste corto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en modelos de difusión para lenguaje: sirve como banco de pruebas para estudiar la adaptación de transformers causales a objetivos de difusión por bloques y comparar la calidad frente a la decodificación autorregresiva clásica.
- Experimentación con decodificación paralela: permite analizar el compromiso entre velocidad y calidad ajustando el umbral `tau` en tareas de generación corta.
- Prototipado de pipelines de inferencia personalizados: su script `blockdiff_inference.py` ilustra cómo parchear máscaras de atención y convoluciones en tiempo de carga, útil para quien diseñe variantes propias.
- Docencia y divulgación: ejemplo didáctico de fine-tuning con objetivo de difusión enmascarada sobre un modelo de 1,7B parámetros que cabe en hardware de gama alta de consumo.
- Estudio de eficiencia de muestreo: análisis de cuántos tokens por paso hacia delante se pueden generar antes de degradar la coherencia del texto.
- Base para futuros ajustes: punto de partida para entrenamientos más largos que corrijan los artefactos actuales (repeticiones, truncamientos) antes de plantear usos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 3,5 GB solo para pesos (1,72B parámetros), más memoria para activaciones y caché; se recomienda al menos 8-12 GB para trabajar con comodidad.
- GPU recomendadas: A100 o H100 para experimentación a escala; RTX 4090 o RTX 3090 para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8-16 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante).
- Opciones de despliegue: el autor indica que `generate()` estándar no funciona correctamente; es necesario usar el script `blockdiff_inference.py` con transformers >= 5.12. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del valor de `tau` y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Diffusion-LFM3-1.7B-pre | 1,72B | 480 tokens (15 bloques x 32) | Block-diffusion sobre LFM3 | LFM Open License v1.0 | Hugging Face (research preview) |
| LiquidAI/LFM3-1.7B-Base | 1,7B | no disponible en la informacion | Transformer causal | LFM Open License v1.0 | Hugging Face |
| Modelos de difusión de texto tipo Dream | no disponible | no disponible | Masked diffusion | no disponible | no disponible |

La comparación con alternativas de difusión de texto no puede completarse con datos concretos porque la información proporcionada no incluye sus especificaciones.

## Limitaciones y advertencias

- Research preview entrenada solo 377 pasos de optimizador: los resultados pueden contener palabras repetidas, palabras truncadas y errores factuales.
- El autor declara explícitamente que no es apto para producción.
- Contexto efectivo muy reducido (480 tokens), insuficiente para la mayoría de aplicaciones reales.
- `generate()` estándar de transformers no produce resultados correctos; requiere el script específico del repositorio.
- No se documentan idiomas soportados ni evaluaciones de sesgo; se desconoce su comportamiento multilingüe.
- Riesgo elevado de alucinación por el ajuste corto y el paradigma experimental.
- Licencia LFM Open License v1.0: uso comercial permitido solo a personas o entidades con ingresos anuales inferiores a 10 millones de dólares; las organizaciones sin ánimo de lucro cualificadas pueden usarlo con fines no comerciales o de investigación. Cualquier redistribución debe incluir la licencia, mantener los avisos de atribución y declarar las modificaciones.
- El proyecto no está afiliado ni respaldado por Liquid AI; los nombres "LFM" y "Liquid AI" se usan solo para identificar el origen del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerAIO/Diffusion-LFM3-1.7B-pre
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Script de inferencia: `blockdiff_inference.py` (incluido en el repositorio del modelo)
- Licencia: `LICENSE` y `NOTICE` (incluidos en el repositorio del modelo)
