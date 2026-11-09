# summerAIO/diffusion-lfm2.5-24b-a2b-merged

## Resumen

`summerAIO/diffusion-lfm2.5-24b-a2b-merged` es un checkpoint experimental publicado por el usuario independiente summerAIO, que aplica un ajuste fino de difusión enmascarada por bloques (block masked diffusion) sobre el modelo `LiquidAI/LFM2.5-24B-A2B`. No se trata de una publicación oficial de Liquid AI y el propio autor lo etiqueta como material de investigación y evaluación, no como un modelo listo para producción.

El modelo parte de una arquitectura MoE (mezcla de expertos) de Liquid AI con 23.971.587.712 parámetros totales y 2B de parámetros activos por token, y sustituye la decodificación autorregresiva por un muestreador de difusión por bloques que genera tokens en paralelo sobre un lienzo (canvas) fijo. El objetivo declarado del experimento es medir latencia: en una A100 80 GB se alcanzaron medianas de hasta 639,16 tokens de salida por segundo en configuraciones concretas.

La relevancia práctica es limitada y debe subrayarse: la propia model card advierte de repeticiones severas, fragmentos mezclados entre idiomas, código Python malformado y bucles de tokens, y reconoce que no se encontró ninguna configuración de inferencia que superase simultáneamente las pruebas de aritmética, respuesta corta exacta y detección de repetición. Para respuestas generales, el autor recomienda usar la decodificación autorregresiva del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (lfm2_moe) con adaptación a difusión enmascarada por bloques; el checkpoint incluye un modo de atención distinto del causal ordinario |
| Parametros totales | 23.971.587.712 (≈24B) |
| Parametros activos | 2B (denominación A2B del modelo base) |
| Longitud de contexto | no disponible (el experimento usa lienzos de 256, 512 y 1024 tokens) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye y se prueba en BF16) |
| Idiomas soportados | en, ja |
| Licencia | other (LFM Open License v1.0 del modelo base) |
| Formato de pesos | safetensors (BF16, ≈48 GB antes de sobrecarga en tiempo de ejecución) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de Liquid AI con 24B parámetros totales y 2B activos. Sobre él se aplicó un LoRA de rango 64 y alpha 128, entrenado durante 3100 actualizaciones y seleccionado mediante NLL de tokens enmascarados sobre validación fija. El adaptador se fusionó (merged) en los pesos BF16 del modelo base y en los pesos empaquetados de los expertos MoE. La inferencia no usa `generate()` estándar: requiere un muestreador de bloques propio, implementado en `modeling_diffusion_lfm.py` y configurado mediante `inference_recipe.json`, con parámetros de tamaño de bloque y número de pasos de denoising.

Los datos de entrenamiento fueron los ejemplos de entrenamiento de Alpaca y de ARC-Easy, excluyendo los registros de validación y de test final. En 64 ejemplos fijos de validación, la NLL con máscara parcial pasó de 3,0261 a 2,7118 (reducción del 10,39 %) y la NLL con máscara completa de 5,8993 a 5,6291 (4,58 %); el objetivo acordado del 10 % en ambos niveles de corrupción no se alcanzó. En el test final de 256 ejemplos, la NLL con máscara parcial pasó de 3,0005 a 2,7312 (8,97 %) y la de máscara completa de 5,8205 a 5,6774 (2,46 %). Estas pérdidas son entropía cruzada de denoising, no perplejidad autorregresiva ni una medida de corrección en generación libre.

Una advertencia técnica relevante: la comparación estricta de logits enmascarados entre el checkpoint fusionado y el adaptador sin fusionar falló, con una diferencia absoluta máxima de 8,44 y desajuste en top-1. El autor indica que debe tratarse como un artefacto experimental distinto, no como una conversión numéricamente equivalente.

## Capacidades

- Generación de texto con pipeline `text-generation` y plantilla de chat (`apply_chat_template`).
- Generación paralela de tokens mediante difusión enmascarada por bloques, con control de tamaño de lienzo y pasos de denoising.
- Idiomas: inglés y japonés según metadatos; en la práctica la model card reporta fragmentos mezclados entre idiomas.
- No hay evidencia publicada de soporte fiable de tool calling, function calling, razonamiento multi-paso, matemáticas, código, visión ni audio.
- No se documenta modo thinking ni capacidades de agente.
- Calidad de generación libre: el autor reporta repeticiones severas, bucles de tokens y Python malformado; las pruebas de aritmética y respuesta corta exacta no se superan en ninguna configuración del barrido de 1 a 15 pasos.

## Casos de uso

- Investigación sobre decodificación por difusión: reproducir el muestreador de bloques con `modeling_diffusion_lfm.py` para estudiar el comportamiento de la difusión enmascarada sobre un MoE de 24B, comparando NLL de denoising frente al modelo autorregresivo.
- Estudio de latencia y throughput: medir tokens por segundo en A100 80 GB con lienzos de 256, 512 y 1024 tokens y distintos números de pasos, usando la configuración de 1024/12 solo para replicar los 601,95 tokens/s reportados.
- Análisis de degeneración en modelos de difusión: usar el checkpoint como caso de estudio de repetición, bucles de tokens y mezcla de idiomas, y evaluar métricas de detección de repetición.
- Evaluación de artefactos de fusión LoRA: comparar los logits enmascarados del checkpoint fusionado con el adaptador original para estudiar la discrepancia numérica documentada (diferencia máxima 8,44).
- Docencia y divulgación: ilustrar las diferencias entre decodificación autorregresiva y difusión por bloques con un modelo real y código de ejemplo reproducible.
- Reproducibilidad de experimentos: validar las cifras de NLL con máscara parcial y completa sobre los conjuntos de validación y test descritos, siempre que se respeten las licencias de Alpaca (CC-BY-NC-4.0) y ARC.
- No se recomienda su uso en atención al cliente, generación de código en producción, agentes ni ninguna tarea que requiera respuestas fiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que ninguna evaluación amplia de lenguaje, código, multilingüismo o seguridad establece la calidad del modelo.

Datos de latencia medidos en una A100-SXM4-80GB, batch 1, entrada de 256 tokens, salida máxima de 1024 tokens, 3 calentamientos y 5 repeticiones cronometradas:

| Configuracion | Lienzo | Pasos de denoising | Tokens de salida/s (mediana) |
|---|---|---|---|
| Cercana a 600, no orientada a calidad | 1024 | 12 | 601,95 |
| Punto alternativo de latencia | 256 | 4 | 583,93 |
| Punto alternativo de latencia | 512 | 7 | 639,16 |

| Metrica de entrenamiento | Antes | Despues | Reduccion |
|---|---|---|---|
| NLL media mascara, validacion (64 ejemplos) | 3,0261 | 2,7118 | 10,39 % |
| NLL mascara completa, validacion (64 ejemplos) | 5,8993 | 5,6291 | 4,58 % |
| NLL media mascara, test final (256 ejemplos) | 3,0005 | 2,7312 | 8,97 % |
| NLL mascara completa, test final (256 ejemplos) | 5,8205 | 5,6774 | 2,46 % |

## Requisitos de hardware

- VRAM estimada: los pesos BF16 fusionados ocupan aproximadamente 48 GB antes de la sobrecarga en tiempo de ejecución; se necesita una GPU con al menos 80 GB para cargar el checkpoint completo con `device_map="auto"`.
- GPU recomendadas: A100 80 GB (configuración medida por el autor); H100 80 GB es compatible por capacidad de memoria, aunque no se han publicado mediciones en ella.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en tarjetas de 48 GB en BF16; no se documentan cuantizaciones GGUF ni versiones de menor precisión.
- Opciones de despliegue: carga mediante `from_pretrained` del módulo personalizado `modeling_diffusion_lfm.py` con Transformers; el muestreador de difusión es propio y `AutoModelForCausalLM.generate()` ejecuta decodificación causal autorregresiva, no difusión. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 601,95 tokens/s de mediana con lienzo de 1024 y 12 pasos; 639,16 tokens/s con lienzo de 512 y 7 pasos; 583,93 tokens/s con lienzo de 256 y 4 pasos. La latencia depende del prompt, la longitud de salida y el hardware, y solo se midió en una única A100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| summerAIO/diffusion-lfm2.5-24b-a2b-merged | 24B totales, 2B activos | no disponible | Difusión enmascarada por bloques sobre MoE | LFM Open License v1.0 (umbral comercial de 10 M USD de ingresos anuales) | Hugging Face, 0 descargas, 0 likes |
| LiquidAI/LFM2.5-24B-A2B | 24B totales, 2B activos | no disponible en la informacion | MoE autorregresivo | LFM Open License v1.0 | Modelo base oficial de Liquid AI |
| Alternativas comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el propio modelo base: el autor no reclama superioridad sobre él y recomienda la decodificación autorregresiva del upstream para respuestas generales.

## Limitaciones y advertencias

- Degeneración severa en generación libre: repeticiones, fragmentos mezclados entre idiomas, Python malformado y bucles de tokens observados en las pruebas.
- El barrido de 1 a 15 pasos de denoising sobre tres prompts fijos no encontró ninguna configuración que superase a la vez la comprobación aritmética de media, la respuesta corta exacta y el filtro de repetición; no existe una configuración de alta calidad recomendada.
- Aumentar los pasos de denoising no corrigió la degeneración aprendida.
- La comparación de logits enmascarados frente al adaptador sin fusionar falló (diferencia absoluta máxima 8,44, desajuste en top-1): el checkpoint no es una conversión numéricamente equivalente.
- Las pérdidas reportadas son entropía cruzada de denoising, no perplejidad autorregresiva ni una medida de corrección en generación libre, y el objetivo del 10 % en ambos niveles de corrupción no se cumplió.
- Los datos de entrenamiento incluyen Alpaca, con licencia CC-BY-NC-4.0, lo que impide uso comercial del artefacto derivado con independencia de la licencia del modelo base.
- La licencia LFM Open License v1.0 permite redistribución de obras derivadas con atribución y copia de la licencia, pero excluye el uso comercial por entidades con ingresos anuales iguales o superiores a 10 millones de dólares.
- Solo se midió en una configuración de A100; no hay datos de latencia en otro hardware ni con otras longitudes de prompt.
- No hay benchmarks amplios de lenguaje, código, multilingüismo ni seguridad que respalden su uso en producción.
- Riesgo de alucinación y de sesgos: no evaluado ni documentado en la información disponible.
- El autor recomienda explícitamente no describirlo como un modelo de 600 tokens/s que preserve calidad ni como un modelo utilizable de forma general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerAIO/diffusion-lfm2.5-24b-a2b-merged
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia del modelo base (LFM Open License v1.0): https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Dataset Alpaca: https://huggingface.co/datasets/tatsu-lab/alpaca
- Dataset ARC: https://huggingface.co/datasets/allenai/ai2_arc
