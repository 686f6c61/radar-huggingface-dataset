# Zainulabedin1/pinn-heat-transfer

## Resumen

`pinn-heat-transfer` es una red neuronal informada por la física (PINN, *physics-informed neural network*) publicada por el usuario Zainulabedin1 en HuggingFace. No es un modelo de lenguaje ni un modelo generativo: es un artefacto de investigación que aproxima la solución de la ecuación del calor transitoria unidimensional `u_t = α·u_xx` con α = 0,1, condiciones de contorno de Dirichlet nulas `u(0,t) = u(1,t) = 0` y condición inicial `u(x,0) = sin(πx)`, sobre el dominio x ∈ [0,1], t ∈ [0,1].

El modelo se entrena exclusivamente con puntos de colocación sintéticos muestreados de forma aleatoria uniforme en el dominio, sin ningún dataset, sensor o medición experimental. La solución analítica `u(x,t) = sin(πx)·exp(−απ²t)` se usa únicamente como referencia para medir el error a posteriori, nunca como objetivo de entrenamiento. Es, por tanto, una demostración metodológica del enfoque PINN sobre una EDP canónica, no un solver de ingeniería validado.

Su relevancia es acotada y muy específica: con ~7,8k parámetros y entrenamiento en CPU, consigue un error relativo L2 de 1,03e-03 frente a la solución exacta en una malla de evaluación de 101×101, un orden de magnitud mejor que un MLP de la misma arquitectura ajustado a muestras de la solución analítica. El repositorio ocupa 0,0 GB y consta únicamente de `pinn.pt`, `model.py` y `config.json`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectado 2 → 50 → 50 → 50 → 50 → 1 con activaciones tanh (PINN) |
| Parametros totales | ~7.800 (≈7,8k) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es un par continuo (x, t) con x ∈ [0,1], t ∈ [0,1] |
| Tipos de cuantizacion | no disponible; solo se publican pesos en precisión nativa de PyTorch (fp32) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | `pinn.pt` (state dict de PyTorch); también aceptado como `pytorch_model.bin` |
| Funcion de perdida | `mean(residuo PDE²) + 100·IC + 100·BC`, residuo PDE calculado por autograd |
| EDP y parametros fisicos | `u_t = 0,1·u_xx`; Dirichlet nulas en x = 0 y x = 1; `u(x,0) = sin(πx)` |
| Fecha de creacion (metadatos HF) | 2026-10-19 |
| Ultima actualizacion (metadatos HF) | 2026-10-19 |
| Descargas | 34 |
| Likes | 0 |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa de cuatro capas ocultas de 50 neuronas con activación tanh y dos entradas (x, t) que producen un único escalar u. El sesgo inductivo no viene del tamaño —~7,8k parámetros— sino de la función de pérdida: el residuo de la EDP se calcula con diferenciación automática sobre la salida de la red (`u_t` y `u_xx`), y se suma a los términos de condición inicial y de contorno ponderados por 100. El entrenamiento es, por tanto, *sin datos*: todos los puntos de evaluación de la pérdida son sintéticos. Se usan 2.048 puntos de colocación interiores, 256 para la condición inicial y 256 para las fronteras, remuestreados cada 100 iteraciones.

El procedimiento de optimización combina Adam durante 5.000 iteraciones con tasa de aprendizaje 1e-3 en CPU, seguido de un refinamiento con L-BFGS de 200 iteraciones. No se reporta uso de RLHF, DPO ni ningún ajuste por preferencias; el autor documenta explícitamente que la solución analítica no participó en el entrenamiento. La innovación técnica del artefacto es metodológica: demuestra que el residuo de la EDP actúa como un sesgo inductivo más fuerte que el ajuste supervisado a 10.000 muestras de la solución, lo que se traduce en una mejora de un orden de magnitud en error relativo L2 con la misma arquitectura.

## Capacidades

- Aproximar la solución de la ecuación del calor 1-D transitoria `u_t = 0,1·u_xx` en x ∈ [0,1], t ∈ [0,1] con las condiciones inicial y de contorno indicadas.
- Evaluación *mesh-free*: el modelo es una función continua, por lo que puede evaluarse en cualquier par (x, t) dentro del dominio, sin malla predefinida.
- Cálculo de derivadas de la salida respecto a sus entradas mediante autograd (usado internamente para el residuo PDE; no se expone como API en `model.py`).
- Inferencia sobre lotes de puntos vía `predict_xt(model, x_array, t)`.
- No soporta generación de texto, razonamiento, código, matemáticas simbólicas, visión, audio, tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües. No es un modelo de lenguaje y no procesa tokens.
- No resuelve otras EDP, otros valores de α, otros tiempos finales ni otras condiciones de contorno distintas de las declaradas.

## Casos de uso

- Verificación de solvers numéricos de difusión: el modelo proporciona un campo de temperatura de referencia con error relativo L2 de 1,03e-03 frente a la solución exacta, útil para contrastar la salida de un método de diferencias finitas o de elementos finitos en la misma configuración física antes de aplicarlo a un caso real.
- Docencia de PINNs: con `model.py` y ~7,8k parámetros, el artefacto sirve como ejemplo mínimo y reproducible de cómo construir una pérdida con residuo de EDP vía autograd, incluida la comparación con un baseline sin física.
- Material de justificación metodológica: el autor documenta que la pérdida física supera en un orden de magnitud al ajuste puro de datos (1,03e-03 frente a 1,01e-02 de error relativo L2), lo que permite ilustrar con números concretos cuándo un prior físico compensa la falta de datos.
- Generación de campos continuos para visualización: evaluar `predict_xt` sobre mallas densas (por ejemplo 101×101 o más finas) para producir mapas de calor u(x,t) sin coste de simulación por cada punto solicitado.
- Prueba de humo de infraestructura de entrenamiento: al entrenar en CPU en minutos con Adam (5.000 iteraciones) más L-BFGS (200 iteraciones), es un caso de juguete adecuado para validar pipelines de entrenamiento, registro de métricas o integración continua antes de escalar a modelos mayores.
- Punto de partida para reentrenamiento: la arquitectura y el código permiten reajustar α, la condición inicial o las condiciones de contorno y reentrenar desde cero; el modelo publicado en sí no generaliza a esas variantes, pero el código acelera la puesta a punto.
- Referencia en cuadernos de análisis térmico: para la configuración concreta (α = 0,1, dominio unidad, t hasta 1,0), permite obtener valores de u en tiempo de ejecución sin resolver la EDP en cada consulta.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los reportados por el autor en la model card, medidos sobre una malla de evaluación de 101×101 tras el entrenamiento.

| Modelo | Error relativo L2 | Error máximo absoluto |
|---|---|---|
| PINN (pérdida física, sin datos) | 1,03e-03 | 1,20e-03 |
| Baseline MLP de ajuste a datos (misma arquitectura, regresión sobre muestras analíticas) | 1,01e-02 | 4,50e-02 |

Descomposición del error del PINN entrenado sobre un lote nuevo de colocación sintética (n = 24.000):

| Termino | MSE |
|---|---|
| Residuo PDE ⟨(u_t − α·u_xx)²⟩ | 4,22e-05 |
| Condicion inicial ⟨(u − sin πx)²⟩ en t = 0 | 7,24e-08 |
| Condicion de contorno ⟨u²⟩ en x = 0, 1 | 7,73e-08 |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otras implementaciones de PINN u otros operadores neuronales.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable. Con ~7,8k parámetros en fp32 los pesos ocupan aproximadamente 31 KB; el consumo real lo domina el runtime de PyTorch.
- GPU recomendadas: ninguna. El autor entrena en CPU; el modelo cabe en cualquier GPU, incluida una GTX 1050 o una iGPU, y también funciona en CPU sin penalización apreciable.
- Cabe en GPU de consumo: sí, en todas; también en Raspberry Pi y en entornos sin acelerador.
- Opciones de despliegue: PyTorch nativo (`model.py` con `load_model()` y `predict_xt()`), exportación a TorchScript, exportación a ONNX o reimplementación directa en NumPy, dado que la topología es un conjunto de multiplicaciones matriciales densas con tanh.
- Latencia y throughput: no medidos por el autor. Estimación a partir de la topología: ~7.650 MACs por punto (unas 1,5e4 operaciones en coma flotante); evaluar la malla completa de 101×101 ≈ 10.201 puntos supone del orden de 1,5e8 FLOPs, es decir, unos pocos milisegundos en una CPU moderna por lotes vectorizados. Cifra orientativa, no verificada.
- Entrenamiento: Adam 5.000 iteraciones a lr 1e-3 más L-BFGS 200 iteraciones, ejecutado en CPU según la model card; no se especifica duración ni hardware exacto.

## Comparativa con modelos similares

La información disponible solo permite comparar con el baseline documentado por el propio autor. Otras implementaciones de PINN (DeepXDE, PyTorch-PDE) y operadores neuronales alternativos (FNO, DeepONet) no tienen cifras reportadas en esta información, por lo que sus filas se marcan como no disponibles.

| Modelo / enfoque | Parametros | Entrada | Error relativo L2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pinn-heat-transfer (PINN) | ~7,8k | (x, t) continuo | 1,03e-03 | no disponible | HuggingFace, repo de 0,0 GB |
| Baseline MLP de ajuste a datos | ~7,8k (misma arquitectura) | (x, t) continuo | 1,01e-02 | no aplica (solo citado en la model card) | no publicado como checkpoint |
| Otras implementaciones de PINN (DeepXDE y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Operadores neuronales (FNO, DeepONet) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Validez restringida a α = 0,1, T = 1,0 y las condiciones inicial y de contorno declaradas. El propio autor advierte de que no debe esperarse que resuelva otras EDP, otros coeficientes ni otras fronteras.
- No hay datos reales: el error se mide contra la solución analítica exacta, no contra mediciones físicas. No es un solver de ingeniería validado ni modela ningún experimento, material o dispositivo.
- Licencia no especificada en la model card: no puede asumirse permiso de uso comercial, redistribución ni modificación. Es un bloqueo objetivo para cualquier integración en producción.
- Sesgos y alucinación: no aplica en el sentido habitual, pero sí existe un riesgo análogo de extrapolación silenciosa: fuera del dominio o de la configuración entrenada, `predict_xt` devolverá valores sin ninguna garantía ni señal de incertidumbre.
- Sin cuantificación de incertidumbre: el modelo devuelve un único valor puntual, sin intervalos de confianza ni estimación de error por punto.
- Sesgo espectral propio de las MLP con tanh: las soluciones de mayor frecuencia o con gradientes pronunciados requerirían más anchura de red o técnicas de realce de frecuencias, no incluidas aquí.
- Trazabilidad y mantenimiento: 34 descargas, 0 likes y un único autor; sin versión, sin tests, sin paper asociado en la información disponible. No hay garantía de soporte ni de corrección de errores.
- El repositorio figura con 0,0 GB y la API se limita a tres funciones (`HeatPINN`, `load_model`, `predict_xt`); no hay servidor de inferencia, tokenizador ni interfaz estándar de `transformers`, por lo que no puede servirse con vLLM, TGI u Ollama.
- Los metadatos de HuggingFace indican fecha de creación 2026-10-19, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de depender de él.

## Enlaces

- HuggingFace: https://huggingface.co/Zainulabedin1/pinn-heat-transfer
- Paper, blog, repositorio de código adicional o demo: no disponible en la información proporcionada (la model card no incluye enlaces externos).
