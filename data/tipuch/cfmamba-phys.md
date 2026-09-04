# Tipuch/CFMamba-Phys

## Resumen

CFMamba-Phys es un modelo de vision por computador que estima la forma de onda de pulso de volumen sanguineo (BVP, por sus siglas en ingles) a partir de video facial, una tecnica conocida como fotopletismografia remota (rPPG). Se trata de una reimplementacion no oficial, desarrollada de forma independiente por el usuario Tipuch, del modelo descrito en el articulo de Wang et al. (2026) publicado en *Biomedical Signal Processing and Control*. No esta afiliada con los autores originales ni con la revista, y no se distribuyen pesos, codigo ni datos procedentes de ellos.

El modelo resuelve el problema de medir la frecuencia cardiaca sin contacto fisico, prediciendo una muestra de BVP por cada frame de video. La frecuencia cardiaca no se regresa directamente, sino que se obtiene despues mediante filtrado de paso de banda Butterworth (0.75-2.5 Hz) y calculo de intervalos entre latidos. Con solo 0.9327 millones de parametros y 79.15 millones de MACs por frame, es un modelo extremadamente compacto, lo que lo hace relevante para aplicaciones de monitorizacion fisiologica en entornos con recursos limitados. La arquitectura combina un state space model (SSM) tipo Mamba con tecnicas de fusion temporal y atencion de canales, y requiere CUDA para ejecutarse, ya que el scan se implementa mediante un kernel Triton sin ruta CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State space model (Mamba-3) con Fusion Stem, PGA, atencion de canales (CAM), DF-FFN y cabeza 1D conv |
| Parametros totales | 0.9327 M |
| Parametros activos | no disponible |
| Longitud de contexto | No aplica (modelo de video; procesa clips de 300 frames = 10 s a 30 fps) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | No aplica (modelo de vision por computador; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (no se especifica el formato exacto de los archivos de pesos) |

## Arquitectura y entrenamiento

La arquitectura sigue un pipeline definido: el video se decodifica a 30 fps y se recorta la cara; los frames crudos se fusionan con cuatro diferencias temporales mediante un Fusion Stem; despues, una capa PGA (Gaussian skin prior) aplica un prior gaussiano de piel, gating por canales y colapso del espacio; a continuacion, cuatro bloques compuestos por Mamba + CAM (channel adaptive modulation) y DF-FFN (frequency-domain feed-forward network) procesan las caracteristicas; finalmente, una cabeza 1D conv genera una muestra BVP por frame. El modelo se entrena con una perdida combinada: `L = 0.8 * L_time + 1.0 * L_freq`, donde `L_time` es `1 - Pearson(S_pred, S_gt)` y `L_freq` es una entropia cruzada sobre 105 frecuencias candidatas entre 45 y 150 bpm.

Los datos de entrenamiento provienen de tres corpus publicos, combinados en una division 90/3/7 agrupada por sujeto y estratificada por fuente: MCD-rPPG (3600 grabaciones, 600 sujetos, 180 h), UBFC-rPPG (50 sujetos, 55 min, con frecuencia de frames variable entre 23.2 y 29.98 fps) y MR-NIRP (44 sesiones, 117.9 min, usando solo el flujo RGB). Los archivos de datos no se incluyen en el repositorio; deben obtenerse de sus fuentes originales bajo sus propios terminos.

El modelo presenta desviaciones deliberadas respecto al paper original: usa Mamba-3 en lugar de Mamba-1, procesa clips de 300 frames en lugar de 160, emplea un peso de perdida temporal de 0.8 en lugar de 0.2, y lee la frecuencia cardiaca como el intervalo inter-latido mediano en lugar del pico espectral dominante. Estas diferencias implican que los resultados no son directamente comparables con los de rPPG-Toolbox.

## Capacidades

- Prediccion de la forma de onda BVP a partir de video facial, con una muestra por frame.
- Estimacion de la frecuencia cardiaca mediante filtrado de paso de banda Butterworth (0.75-2.5 Hz) y calculo de intervalos entre latidos.
- Acepta una mascara de piel como entrada adicional para mejorar la seleccion de la region de interes.
- Procesa clips de 300 frames (10 segundos a 30 fps).
- Es un modelo de regresion de senales fisiologicas; no soporta generacion de texto, tool calling, razonamiento multi-paso ni capacidades multilingues.
- No es un modelo multimodal; no procesa audio ni texto.
- Requiere CUDA para la inferencia, ya que el scan se implementa con un kernel Triton.

## Casos de uso

- Monitorizacion de frecuencia cardiaca sin contacto en telemedicina: el modelo puede procesar video facial grabado con una camara web para estimar la frecuencia cardiaca en tiempo real, lo que resulta util en consultas virtuales o triaje remoto. Su bajo coste computacional permite ejecutarlo en equipos modestos.
- Analisis de senales fisiologicas en investigacion clinica: los investigadores pueden extraer la forma de onda BVP a partir de grabaciones de video para estudiar variabilidad cardiaca, estres o respuestas fisiologicas, gracias a la salida de una senal temporal continua en lugar de un valor unico.
- Control de signos vitales en entornos de bajo recurso: al tener solo 0.93 millones de parametros, el modelo puede desplegarse en GPU de gama baja o incluso en dispositivos embebidos con soporte CUDA, lo que lo hace adecuado para entornos sin equipamiento medico especializado.
- Integracion en pipelines de analisis de video para salud: puede insertarse en sistemas existentes que procesan video para detectar anomalias o monitorizar pacientes, ya que se integra facilmente en flujos de PyTorch.
- Aplicaciones de bienestar y fitness: los usuarios pueden obtener su frecuencia cardiaca a partir de un video selfie durante una sesion de ejercicio, sin necesidad de un pulsometro de contacto. La prediccion de BVP permite ademas analizar la calidad de la senal.
- Investigacion en modelos de espacio de estado aplicados a vision: este repositorio sirve como referencia de como reimplementar arquitecturas Mamba para tareas de video, incluyendo el uso de kernels Triton y tecnicas de fusion temporal.
- Deteccion de anomalias en la forma de onda BVP: al disponer de la senal completa, es posible analizar la regularidad de los intervalos entre latidos para identificar posibles irregularidades, aunque se requiere validacion clinica adicional.

## Benchmarks y rendimiento

El modelo card proporciona una evaluacion interna sobre la division de prueba combinada, con 4482 ventanas de 300 frames, usando el checkpoint de la epoca 48 de 50 y la lectura por intervalo mediano:

| Split | MAE (bpm) | RMSE | rho | MACC | SNR | n |
|---|---|---|---|---|---|---|
| Test, all | 2.75 | 5.20 | 0.912 | 0.833 | +2.69 dB | 4482 |
| Test, MCD | 2.77 | 5.23 | 0.909 | 0.832 | +2.66 dB | 4419 |
| Test, MR-NIRP | 1.34 | 2.27 | 0.951 | 0.925 | +5.19 dB | 42 |
| Test, UBFC | 1.44 | 1.96 | 0.997 | 0.832 | +3.93 dB | 21 |

El paper original indica que CFMamba-Phys es el modelo mas compacto en su comparativa, con 0.91 millones de parametros y 80.82 millones de FLOPs por frame. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje. Los numeros presentados no son comparables con las tablas de rPPG-Toolbox debido a la lectura por intervalo mediano.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Dado el tamano de 0.93 millones de parametros, el modelo es muy ligero, pero no se ofrecen cifras oficiales de consumo de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; el kernel Triton requiere CUDA. El autor no especifica modelos concretos de GPU.
- Si cabe en consumer GPU: es previsible que si, dado el reducido numero de parametros, pero no hay confirmacion explicita en la documentacion.
- Opciones de despliegue: PyTorch en GPU NVIDIA. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de video.
- Latencia y throughput: no disponibles. El modelo tiene 79.15 millones de MACs por frame, pero no se proporcionan mediciones de latencia ni de rendimiento.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos comparativos con otros modelos de rPPG. El paper original (Wang et al., 2026) afirma que CFMamba-Phys es el modelo mas compacto de su comparativa, pero no se aportan los resultados de los modelos comparados en la documentacion disponible.

## Limitaciones y advertencias

- Es una reimplementacion no oficial, no afiliada con los autores originales, no revisada ni respaldada por ellos ni por la revista. El nombre se usa solo para identificar la arquitectura reproducida.
- Existen desviaciones deliberadas respecto al paper: Mamba-3 en lugar de Mamba-1, clips de 300 frames en lugar de 160, peso de perdida temporal de 0.8 en lugar de 0.2, y lectura de frecuencia cardiaca por intervalo mediano en lugar de pico espectral.
- Los resultados no son comparables con las tablas de rPPG-Toolbox, ya que la metodologia de lectura difiere.
- Los datos de entrenamiento no se distribuyen; deben obtenerse de sus fuentes originales bajo sus propios terminos. El corpus MCD-rPPG esta disponible en HuggingFace, pero UBFC-rPPG y MR-NIRP no estan verificados.
- Requiere CUDA obligatoriamente; no existe ruta CPU, lo que limita su despliegue en entornos sin GPU NVIDIA.
- No se han documentado sesgos especificos en la informacion proporcionada, pero al entrenarse en corpus de video facial, es probable que existan sesgos demograficos no evaluados.
- La precision puede degradarse en condiciones de iluminacion variable, movimiento de la cabeza o baja calidad de video, como es habitual en los sistemas de rPPG.
- La licencia MIT permite uso comercial, pero los datos de entrenamiento pueden tener restricciones adicionales que deben respetarse por separado.

## Enlaces

- HuggingFace: https://huggingface.co/Tipuch/CFMamba-Phys
- GitHub (codigo): https://github.com/Tipuch/rppg_experiment
- Paper original: https://doi.org/10.1016/j.bspc.2026.110996
- ScienceDirect (articulo): https://www.sciencedirect.com/science/article/pii/S1746809426015508
- Dataset MCD-rPPG: https://huggingface.co/datasets/kyegorov/mcd_rppg
- RhythmMamba (arXiv:2404.06483): https://arxiv.org/abs/2404.06483
- RhythmFormer (arXiv:2402.12788): https://arxiv.org/abs/2402.12788
- CMamba (arXiv:2406.05316): https://arxiv.org/abs/2406.05316
- Mamba-3 (arXiv:2603.15569): https://arxiv.org/abs/2603.15569
