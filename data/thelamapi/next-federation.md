# thelamapi/Next-Federation

## Resumen

Next Federation es un artefacto de investigación publicado en Hugging Face por el usuario thelamapi que no constituye un modelo de lenguaje, sino una simulación reproducible de aprendizaje federado sobre clasificación de dígitos. El repositorio empaqueta los pesos de un perceptrón multicapa (MLP 64→32→10) entrenado de forma federada sobre 10 clientes con distribuciones de etiquetas no IID (sesgo Dirichlet), comparando tres estrategias: FedAvg, FedProx y entrenamiento puramente local. El objetivo es medir no solo la precisión global, sino también la precisión del peor cliente sobre sus propios datos y el tráfico de comunicación generado.

La relevancia del artefacto es metodológica: ofrece una tabla de resultados con 5 semillas por configuración, intervalos de desviación estándar y una réplica en JavaScript que corre en el navegador con paridad numérica exacta respecto a Python (diferencia absoluta máxima de 0 en 4 ejecuciones fijas). Esto lo convierte en una herramienta docente y de validación de algoritmos de agregación federada, no en un modelo generativo desplegable.

Es importante subrayar que todos los clientes se ejecutan en un único proceso: no hubo despliegue en dispositivos reales ni mecanismos de privacidad diferencial. El dataset es un subconjunto limpio de dígitos (64 píxeles de entrada con valores enteros de 0 a 16), y el conjunto de test global son 360 dígitos nunca usados en entrenamiento ni ajuste. No hay información sobre arquitecturas transformer, atención, tokenizadores ni capacidades lingüísticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 64→32→10 con activación ReLU y softmax con entropía cruzada |
| Parametros totales | no disponible (pesos publicados en `model.json`; la topología implica 64·32 + 32 + 32·10 + 10 = 2.410 parámetros, calculado a partir de la arquitectura descrita) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 64 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en JSON, presumiblemente float32; no se documenta cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | JSON (`model.json`) con pesos del modelo global FedProx de la configuración α=0.5, dropout 0.3, semilla 0 |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa de dos capas ocultas y una capa de salida de 10 clases, entrenado con SGD por minilotes de tamaño 20 y tasa de aprendizaje 0.3. La entrada son 64 píxeles enteros en el rango 0–16. El entrenamiento federado se organiza en 40 rondas con 2 épocas locales por ronda. FedAvg realiza una media ponderada por número de muestras de las actualizaciones que llegan; FedProx añade un término proximal (μ/2)‖w − w_global‖² en cada paso local con μ = 0.01. La partición de datos entre los 10 clientes sigue una distribución Dirichlet con parámetro α ∈ {0.1, 0.5, 5.0}, lo que controla el grado de heterogeneidad de etiquetas.

Se modela el abandono de clientes (dropout) con probabilidad independiente por cliente y ronda p ∈ {0.0, 0.3}; la descarga del modelo global a cada cliente se contabiliza igualmente aunque su actualización se pierda. La selección de hiperparámetros (lr y μ) se hizo sobre un conjunto de validación separado con semillas de desarrollo 100–101, con puntuaciones registradas (lr 0.05 → 0.9028, lr 0.1 → 0.9361, lr 0.3 → 0.9528; μ 0.01 → 0.9528, μ 0.1 → 0.95, μ 1.0 → 0.9333). El espacio de Hugging Face ejecuta un port línea a línea a JavaScript con paridad numérica verificada frente a Node en 4 ejecuciones fijas (diferencia absoluta máxima 0). Los pesos liberados corresponden al modelo global FedProx de la configuración α=0.5, dropout 0.3, semilla 0.

## Capacidades

- Clasificación de dígitos a partir de vectores de 64 píxeles enteros (0–16), con salida de 10 probabilidades vía softmax.
- Simulación de entrenamiento federado con 10 clientes en un único proceso, sin despliegue real.
- Comparación algorítmica entre FedAvg, FedProx y entrenamiento local aislado bajo un mismo protocolo.
- Modelado de heterogeneidad de datos mediante partición Dirichlet con α configurable (0.1, 0.5, 5.0).
- Modelado de abandono de clientes con probabilidad independiente por cliente y ronda.
- Medición de tráfico de comunicación en MB (descargas float32 del modelo global más subidas que llegan).
- Ejecución interactiva en navegador mediante el Space asociado, con recálculo de los tres métodos al modificar sesgo, dropout, número de clientes y rondas.
- API de inferencia mínima en Python: `load()` y `predict(spec, pixels)` con entrada `(N, 64)`.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo de pensamiento.

## Casos de uso

- Docencia de aprendizaje federado: el artefacto permite mostrar en clase la diferencia entre precisión global y precisión del peor cliente; con α=0.1 y dropout 0.0, FedAvg alcanza 0.934 global pero solo 0.784 en el peor cliente, frente a 0.961 y 0.880 con α=5.0.
- Validación de implementaciones de agregación: un equipo que implemente FedAvg o FedProx puede comparar sus curvas contra las 18 configuraciones publicadas con 5 semillas cada una y desviaciones estándar documentadas.
- Análisis del impacto del abandono de clientes: la tabla muestra que pasar de dropout 0.0 a 0.3 reduce el tráfico de 7.7 MB a 6.5 MB y la precisión global de 0.934 a 0.928 (α=0.1), lo que sirve para estudiar la robustez frente a caídas.
- Estudio del sesgo de etiquetas: con α=0.1 el entrenamiento local aislado cae a 0.357 de precisión global mientras la media por cliente es 0.920, evidenciando el colapso de modelos locales ante distribuciones no IID.
- Reproducción en navegador sin infraestructura: el Space permite a investigadores sin GPU recalcular los tres métodos variando clientes y rondas, gracias al port JavaScript con paridad numérica verificada.
- Prueba de concepto de inferencia embebida: el modelo de 2.410 parámetros y los pesos en `model.json` permiten integrar un clasificador de dígitos trivial en aplicaciones educativas o demos de borde sin dependencias de framework.
- Referencia para el diseño de experimentos federados: la documentación de selección de hiperparámetros con semillas de desarrollo separadas (100–101) y semillas de evaluación (5 por configuración) sirve de plantilla metodológica.

## Benchmarks y rendimiento

Resultados publicados en la model card (5 semillas por configuración, 40 rondas, 2 épocas locales, lr 0.3, FedProx μ 0.01). Conjunto de test global: 360 dígitos. "Peor cliente" es la precisión mínima sobre el 20 % retenido de cada cliente.

| Configuración | Método | Precisión global | Peor cliente | Media por cliente | Tráfico (MB) |
|---|---|---:|---:|---:|---:|
| α=0.1, dropout=0.0 | FedAvg | 0.934 ± 0.011 | 0.784 ± 0.100 | 0.940 | 7.7 |
| α=0.1, dropout=0.0 | FedProx | 0.934 ± 0.011 | 0.784 ± 0.100 | 0.940 | 7.7 |
| α=0.1, dropout=0.0 | Local only | 0.357 ± 0.011 | 0.448 ± 0.391 | 0.920 | 0.0 |
| α=0.1, dropout=0.3 | FedAvg | 0.928 ± 0.019 | 0.776 ± 0.090 | 0.934 | 6.5 |
| α=0.1, dropout=0.3 | FedProx | 0.929 ± 0.018 | 0.769 ± 0.090 | 0.932 | 6.5 |
| α=0.1, dropout=0.3 | Local only | 0.357 ± 0.011 | 0.448 ± 0.391 | 0.920 | 0.0 |
| α=0.5, dropout=0.0 | FedAvg | 0.953 ± 0.004 | 0.866 ± 0.031 | 0.947 | 7.7 |
| α=0.5, dropout=0.0 | FedProx | 0.952 ± 0.003 | 0.866 ± 0.031 | 0.948 | 7.7 |
| α=0.5, dropout=0.0 | Local only | 0.657 ± 0.019 | 0.674 ± 0.092 | 0.881 | 0.0 |
| α=0.5, dropout=0.3 | FedAvg | 0.952 ± 0.005 | 0.860 ± 0.025 | 0.949 | 6.5 |
| α=0.5, dropout=0.3 | FedProx | 0.952 ± 0.006 | 0.860 ± 0.025 | 0.949 | 6.5 |
| α=0.5, dropout=0.3 | Local only | 0.657 ± 0.019 | 0.674 ± 0.092 | 0.881 | 0.0 |
| α=5.0, dropout=0.0 | FedAvg | 0.961 ± 0.004 | 0.880 ± 0.013 | 0.956 | 7.7 |
| α=5.0, dropout=0.0 | FedProx | 0.960 ± 0.005 | 0.880 ± 0.013 | 0.955 | 7.7 |
| α=5.0, dropout=0.0 | Local only | 0.871 ± 0.006 | 0.755 ± 0.074 | 0.883 | 0.0 |
| α=5.0, dropout=0.3 | FedAvg | 0.960 ± 0.005 | 0.890 ± 0.013 | 0.955 | 6.5 |
| α=5.0, dropout=0.3 | FedProx | 0.959 ± 0.005 | 0.890 ± 0.013 | 0.955 | 6.5 |
| α=5.0, dropout=0.3 | Local only | 0.871 ± 0.006 | 0.755 ± 0.074 | 0.883 | 0.0 |

Observaciones cuantitativas: la brecha entre FedAvg y FedProx es indistinguible dentro del error (diferencias de 0.000 a 0.001); el abandono de clientes apenas degrada la precisión (0.934 → 0.928 con α=0.1) pero reduce el tráfico un 15,6 % (7.7 → 6.5 MB); el entrenamiento local aislado pierde entre 0.09 y 0.58 puntos de precisión global según el sesgo. No se han publicado resultados de benchmarks en la información disponible más allá de esta tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; el modelo tiene 2.410 parámetros y los pesos se serializan en `model.json`, por lo que cabe en CPU y en cualquier GPU integrada.
- GPU recomendadas: ninguna necesaria para inferencia. El entrenamiento de la simulación se registró en una NVIDIA L4, pero el tamaño del modelo permite ejecutarlo en CPU en tiempos despreciables.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) y también en entornos sin GPU; no hay requisitos de memoria relevantes.
- Opciones de despliegue: script Python propio con `inference.load()` y `inference.predict()`; el Space de Hugging Face ejecuta el port JavaScript en el navegador; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este artefacto).
- Latencia y throughput: no disponibles de forma explícita; por la topología (una multiplicación 64×32, otra 32×10 y softmax) la inferencia es de microsegundos en CPU. El cuello de botella real es la simulación federada (40 rondas × 10 clientes × 2 épocas locales), no la inferencia.

## Comparativa con modelos similares

No existen modelos comparables en el sentido habitual de modelos de lenguaje. La comparación relevante es entre los tres métodos de entrenamiento evaluados dentro del propio artefacto:

| Método | Precisión global (α=0.1, sin dropout) | Precisión global (α=5.0, sin dropout) | Peor cliente (α=0.1) | Tráfico (MB) | Licencia |
|---|---:|---:|---:|---:|---|
| FedAvg | 0.934 ± 0.011 | 0.961 ± 0.004 | 0.784 ± 0.100 | 7.7 | CC-BY-4.0 |
| FedProx (μ=0.01) | 0.934 ± 0.011 | 0.960 ± 0.005 | 0.784 ± 0.100 | 7.7 | CC-BY-4.0 |
| Local only | 0.357 ± 0.011 | 0.871 ± 0.006 | 0.448 ± 0.391 | 0.0 | CC-BY-4.0 |

Frente a implementaciones de referencia como Flower, FedML o TensorFlow Federated, no se dispone de comparación publicada en la información proporcionada; el artefacto se limita a un dataset y una topología propios.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso en esos términos es un error de categoría.
- Simulación en un único proceso: no hubo despliegue en dispositivos reales, por lo que no se capturan heterogeneidad de sistema, stragglers ni latencias de red reales.
- Ausencia total de mecanismos de privacidad: no hay privacidad diferencial, agregación segura ni recorte de gradientes; el artefacto no debe presentarse como solución de privacidad.
- El abandono se modela como independiente por cliente y ronda; las caídas reales suelen estar correlacionadas (cortes de red, ciclos de carga), lo que puede sobreestimar la robustez observada.
- Dataset pequeño y limpio (360 dígitos de test global), sin ruido de etiquetas ni desbalanceo extremo más allá del simulado por Dirichlet; los números describen solo esta simulación.
- El modelo liberado es un único punto del espacio de configuraciones (FedProx, α=0.5, dropout 0.3, semilla 0); no representa el rendimiento medio ni el peor caso.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero al ser un artefacto de investigación sin garantías, su uso en producción requeriría validación propia.
- Riesgo de alucinación no aplica; el riesgo real es de interpretación: extrapolar conclusiones sobre federated learning en general a partir de un MLP sobre dígitos.
- Los pesos en `model.json` no documentan el tipo numérico exacto ni un esquema de cuantización; la reproducibilidad bit a bit solo está verificada para el port JavaScript en 4 ejecuciones fijas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/Next-Federation
- Space interactivo: https://huggingface.co/spaces/thelamapi/Next-Federation
- Repositorio de pesos: `model.json` dentro del repositorio del modelo
- Script de inferencia: `inference.py` (`load`, `predict`) dentro del repositorio del modelo
- Imagen de resultados: `preview.png` dentro del repositorio del modelo
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
