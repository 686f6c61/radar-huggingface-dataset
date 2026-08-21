# YanZhanPKU/LaDiT-LLaDA-8B-En2De

## Resumen

LaDiT-LLaDA-8B-En2De es un adaptador LoRA oficial del proyecto Entropy-Valley, presentado en el paper de EMNLP 2026 "Length-Adaptive Decoding for Masked Diffusion Machine Translation". Convierte el modelo base GSAI-ML/LLaDA-8B-Base (8.02B parámetros, arquitectura de difusión enmascarada) en un sistema de traducción automática inglés→alemán mediante decodificación por difusión con máscaras.

El modelo aborda un problema específico de los modelos de difusión de lenguaje: necesitan conocer la longitud del canvas (número de tokens objetivo) antes de comenzar el proceso de denoising, y no disponen de un token EOS autoregresivo para detenerse. Entropy-Valley (EV) resuelve esto con un selector de longitud training-free que evalúa la entropía predictiva media del backbone congelado para cada longitud candidata y decodifica la que minimiza dicha entropía.

El adaptador es el backbone fijo sobre el que EV decodifica; los mismos pesos sirven para las condiciones de oracle de longitud, ratio fijo y EV. El autor declara explícitamente que En→De es un caso límite del paper, incluido como comprobación tipológicamente más distante, y recomienda leer las secciones de resultados y limitaciones antes de usarlo. Para las direcciones donde el método está mejor respaldado, remite a los adaptadores En→Zh y Zh→En.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre GSAI-ML/LLaDA-8B-Base (Transformer de difusion enmascarada) |
| Parametros totales | 8.02B (modelo base) + ~157M entrenables del adaptador (1.95%) |
| Parametros activos | 8.02B (todos los parametros del base estan activos; el adaptador anade ~157M) |
| Longitud de contexto | 1024 tokens maximo (prompt fuente + canvas objetivo) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en bf16; el base soporta cuantizacion estandar) |
| Idiomas soportados | ingles (fuente), aleman (destino) |
| Licencia | llada-8b-base-license (licencia del modelo base, consultar GSAI-ML/LLaDA-8B-Base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base LLaDA-8B es un Large Language Diffusion Model entrenado desde cero bajo el paradigma de pre-entrenamiento y SFT. Emplea un proceso forward de enmascarado de datos y un proceso reverse de generacion, parametrizado por un Transformer que predice tokens enmascarados. El objetivo de entrenamiento es una cota superior de la log-verosimilitud negativa de la distribucion del modelo, lo que permite aprendizaje en contexto y seguimiento de instrucciones.

El adaptador LoRA se entrena con r=64, alpha=128, dropout 0.05, sobre los modulos q_proj, k_proj, v_proj, o_proj, ff_proj, up_proj y ff_out (7 por bloque). Los datos de entrenamiento son 200k pares paralelos WMT19 de-en (configuracion ende del dataset Entropy-Valley-Datasets), igualados en escala a las ejecuciones En↔Zh. La optimizacion usa AdamW (0.9, 0.95), weight decay 0.01, LR coseno con pico 2e-4, 5% warm-up, 3 epocas, batch global 128 y precision bf16. El entrenamiento requirio 8×H20-96GB y aproximadamente 6 GPU-horas.

La decodificacion usa el schedule MED (minimum-entropy decoding) con T=32 pasos y truncamiento por EOS. El grid de longitudes candidatas de EV es R = {1.50, 1.60, 1.70, 1.80, 1.90}, fijado a partir de estadisticas de longitud del corpus de entrenamiento WMT19, no del conjunto de test.

## Capacidades

- Traduccion automatica ingles→aleman mediante decodificacion por difusion enmascarada con seleccion adaptativa de longitud.
- Seleccion de longitud de canvas training-free: EV ejecuta un forward pass con todo enmascarado para cada longitud candidata, puntua por entropia predictiva media y decodifica la minima.
- Compatible con tres condiciones de decodificacion: oracle de longitud (referencia), ratio fijo 1.8 y Entropy-Valley (seleccion automatica).
- El adaptador es reutilizable: los mismos pesos sirven para las tres condiciones; solo cambia la longitud del canvas entregada al decodificador.
- Integrado con el framework Entropy-Valley (implementacion en ladit/decoding/length_adaptive.py).
- Soporta decodificacion con presupuesto de pasos variable (T=2 a T=128), aunque el rendimiento relativo depende del presupuesto.

## Casos de uso

- Investigacion en traduccion con modelos de difusion: el adaptador permite reproducir los experimentos del paper Entropy-Valley y comparar el metodo EV contra el oracle de longitud y el ratio fijo en la direccion En→De.
- Evaluacion de limites de la difusion enmascarada para MT: util para estudiar por que la direccion En→De queda por detras de un baseline autoregresivo LLaMA-3-8B (81.19 COMET×100 frente a 73.82 del oracle de longitud), aislando el problema de seleccion de canvas del problema de capacidad del backbone.
- Analisis de sensibilidad al presupuesto de pasos: el modelo permite estudiar como cambia el ranking entre EV y ratio fijo segun T (EV lidera en T=2 y T=8, pero cae ligeramente por debajo en T≥64).
- Comparacion tipologica en MT: como caso limite declarado, sirve para contrastar el comportamiento del metodo en pares de lenguas tipologicamente distantes frente a los pares En↔Zh donde el metodo esta mejor respaldado.
- Desarrollo de selectores de longitud training-free: el adaptador proporciona un banco de pruebas para nuevas heuristicas de seleccion de canvas sobre un backbone de difusion fijo.
- Reproduccion de resultados cientificos: con las tres semillas de entrenamiento reportadas, permite verificar las medias y desviaciones estandar publicadas en el paper.

## Benchmarks y rendimiento

Resultados en WMT22 En→De News test set (N=2,037), con decodificacion MED de 32 pasos. Media ± desviacion estandar sobre las tres semillas de entrenamiento reportadas en el paper. Gap closure = (metodo - Ratio) / (Oracle - Ratio).

| Metodo de longitud | COMET-22 | Gap closure | sacreBLEU |
|---|---|---|---|
| Length oracle (cota superior) | 0.7382 ± 0.0090 | 100% | 22.55 ± 0.77 |
| Fixed ratio 1.8 (baseline) | 0.7170 ± 0.0090 | 0% | 20.73 ± 0.68 |
| Entropy-Valley | 0.7240 ± 0.0078 | 33.0 ± 8.4% | 21.55 ± 0.85 |

El repositorio libera una de las tres ejecuciones de entrenamiento; las puntuaciones individuales estan dentro de las desviaciones estandar reportadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base LLaDA-8B requiere aproximadamente 16 GB en bf16 (8.02B parametros × 2 bytes). Con el adaptador LoRA, la VRAM adicional es minima (~0.3 GB). En cuantizacion de 4 bits, cabria en ~5-6 GB.
- GPU recomendadas: el entrenamiento se realizo en 8×H20-96GB. Para inferencia, una GPU con 24 GB (RTX 4090, A10G) es suficiente en bf16; con cuantizacion, una RTX 3090/4080 de 16 GB podria bastar.
- Compatibilidad con GPU de consumo: si, en cuantizacion 4-bit u 8-bit cabe en GPUs consumer de 16-24 GB.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria peft de HuggingFace sobre el base. Para el pipeline de decodificacion por difusion, se requiere el codigo del framework Entropy-Valley (github.com/Entropy-Valley/Entropy-Valley). No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible. La decodificacion por difusion con T=32 pasos es inherentemente mas lenta que la autoregresiva; cada paso requiere un forward pass completo del modelo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LaDiT-LLaDA-8B-En2De (este) | Difusion enmascarada + LoRA | 8.02B + 157M | 1024 | llada-8b-base-license | En→De, caso limite declarado |
| LaDiT-LLaDA-8B-En2Zh | Difusion enmascarada + LoRA | 8.02B + 157M | 1024 | llada-8b-base-license | En→Zh, direccion con mejor soporte |
| LaDiT-LLaDA-8B-Zh2En | Difusion enmascarada + LoRA | 8.02B + 157M | 1024 | llada-8b-base-license | Zh→En, direccion con mejor soporte |
| LLaMA-3-8B autoregresivo (baseline del paper) | Transformer autoregresivo | 8B | 8192 | llama3 | Alcanza 81.19 COMET×100 en En→De, ~7.4 puntos por encima del oracle de longitud LLaDA |

No se dispone de comparativa con otros sistemas de traduccion neuronal (p. ej. NLLB, M2M100) en la informacion proporcionada.

## Limitaciones y advertencias

- La significancia a nivel de frase no se sostiene: la diferencia EV − Ratio es de +0.0034 COMET con IC 95% [−0.0016, +0.0086] y p=0.091 en bootstrap pareado. Pasa la prueba de Wilcoxon (p=8.3×10⁻³) pero no la de bootstrap; la evidencia por frase no es concluyente.
- El presupuesto de pasos invierte el ranking: EV supera al ratio fijo en T pequeñas (T=2: 0.4030 vs 0.3915; T=8: 0.6089 vs 0.5862) pero queda ligeramente por debajo en T≥64 (0.7481 vs 0.7501 en T=64; 0.7516 vs 0.7545 en T=128). El resultado reportado es con T=32.
- La brecha no es principalmente un problema de longitud: un baseline autoregresivo LLaMA-3-8B con datos igualados alcanza 81.19 COMET×100, unos 7.4 puntos por encima incluso del oracle de longitud LLaDA. Suministrar la longitud de referencia no cierra la brecha; el deficit En→De es un problema de backbone/capacidad, no de seleccion de canvas.
- EV esta limitado a la seleccion de canvas dentro de un backbone fijo; no mejora la capacidad del modelo base.
- No se han publicado evaluaciones humanas en la informacion disponible.
- La licencia llada-8b-base-license del modelo base debe consultarse para restricciones de uso comercial.
- El adaptador solo cubre la direccion En→De; no es un sistema de traduccion multilingue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YanZhanPKU/LaDiT-LLaDA-8B-En2De
- Modelo base: https://huggingface.co/GSAI-ML/LLaDA-8B-Base
- Modelo base instruct: https://huggingface.co/GSAI-ML/LLaDA-8B-Instruct
- Codigo y paper (arXiv proximamente): https://github.com/Entropy-Valley/Entropy-Valley
- Coleccion de modelos y dataset: https://huggingface.co/collections/YanZhanPKU/entropy-valley
- Dataset Entropy-Valley-Datasets: https://huggingface.co/datasets/YanZhanPKU/Entropy-Valley-Datasets
- Paper LLaDA (arXiv): https://arxiv.org/abs/2502.09992
- Paper LLaDA (HTML): https://arxiv.org/html/2502.09992v1
- Repositorio oficial LLaDA: https://github.com/ML-GSAI/LLaDA
