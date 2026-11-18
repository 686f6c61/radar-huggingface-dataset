# Viverun/lhco-rnd-event-gae

## Resumen

`Viverun/lhco-rnd-event-gae` es un autoencoder de grafos no supervisado desarrollado por el autor independiente Viverun para deteccion de anomalias en eventos de fisica de altas energias. Se entrena exclusivamente con eventos de fondo QCD del dataset LHC Olympics 2020 R&D y produce una puntuacion de anomalia por evento basada en distancia Chamfer sobre las particulas reconstruidas. El modelo contiene 95.888 parametros y opera sobre un maximo de 48 particulas por evento (pT, eta, phi), con un espacio latente de 16 dimensiones.

Su relevancia no reside en el rendimiento, sino en su valor como resultado negativo documentado. Para la senal W' -> XY del dataset, las puntuaciones del autoencoder estan invertidas: el ROC AUC se situa entre 0,397 y 0,448, por debajo de 0,5, mientras que una variable simple sin entrenamiento (pT medio por particula, HT/N) alcanza 0,811. El autor publica los pesos, el codigo y las semillas para que el fallo sea reproducible y sirva de control negativo frente a metodos nuevos.

El proyecto esta discontinuado desde noviembre de 2026: ningun metodo probado supero el umbral pre-registrado (AUC 0,811). El repositorio incluye tres checkpoints (seed0, seed1, seed2), latentes de entrenamiento, historicos de entrenamiento y puntuaciones del conjunto de test congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder de grafos con capas de agregacion de vecinos (neighbour-averaging) y decodificador MLP |
| Parametros totales | 95.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de hasta 48 particulas (el paper uso P = 350) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa) |
| Idiomas soportados | no aplica (modelo de fisica de particulas, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (`seed{0,1,2}/model.safetensors`) |

## Arquitectura y entrenamiento

La red procesa cada evento como un conjunto de particulas con caracteristicas (log pT, eta, cos phi, sin phi). Aplica tres capas de neighbour-averaging con anchura 64, radio Delta R <= 0,4, conexion residual y LayerNorm. Despues agrega mediante pooling de media, maximo y ponderado por pT, comprime a un espacio latente de 16 valores y decodifica con un MLP las 48 particulas de mayor pT. La perdida es la distancia Chamfer simetrica sobre las cuatro caracteristicas citadas.

El entrenamiento usa 180.000 eventos de fondo QCD (filas 45.000 en adelante del fichero `events_anomalydetection_v2.h5`) y 20.000 eventos de fondo para validacion, sin ninguna senal. Optimizador AdamW con learning rate 0,001, weight decay 0,00001, batch de 256 y recorte de gradiente. Cada checkpoint se entreno 30 epocas; la mejor perdida de validacion fue 0,131 (seed0), 0,119 (seed1) y 0,132 (seed2). El scoring se realiza con tres variantes: distancia Chamfer, kNN sobre latentes (media de distancia a los 20 vecinos mas cercanos del conjunto de entrenamiento) y GMM (log-verosimilitud negativa bajo una mezcla gaussiana de 8 componentes con covarianza completa).

## Capacidades

- Puntuacion de anomalia por evento mediante distancia Chamfer sobre particulas reconstruidas.
- Puntuacion kNN sobre el espacio latente de 16 dimensiones, con ajuste sobre `latents_fit.npy`.
- Puntuacion GMM sobre el mismo espacio latente.
- Carga y ejecucion autocontenida mediante el paquete `hv_event_ae` (solo requiere `torch`, `numpy` y `safetensors`).
- Reproduccion exacta de las puntuaciones almacenadas (diferencia maxima de 1e-5 en Chamfer).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Reproduccion del resultado del paper: cargar `seed0`, `seed1` o `seed2` y verificar que el AUC queda en el rango 0,397-0,448 sobre el test congelado, confirmando la inversion de puntuaciones documentada.
- Control negativo en el desarrollo de nuevos detectores: cualquier metodo candidato debe superar el AUC de este autoencoder para demostrar que aporta senal real frente a un fallo conocido.
- Analisis de dependencia con la complejidad del evento: comparar las puntuaciones Chamfer, kNN y GMM con la multiplicidad y el pT medio por particula para estudiar por que el modelo asigna puntuaciones mas altas al fondo.
- Estudio metodologico de sesgos en autoencoders de reconstruccion: el caso ilustra como la perdida de reconstruccion favorece eventos con menos particulas y mayor pT, lo que invierte el ranking de anomalia.
- Docencia y divulgacion sobre evaluacion en deteccion de anomalias: el repositorio ofrece pesos, latentes, historicos y puntuaciones listos para un cuaderno didactico.
- Verificacion de infraestructura de evaluacion: usar `test_scores.parquet` y la columna `h5_row` para validar pipelines propios de lectura del HDF5 y calculo de AUC antes de desplegar metodos nuevos.

## Benchmarks y rendimiento

Conjunto de test congelado: 5.000 eventos de fondo y 5.000 de senal.

| Checkpoint | Chamfer | kNN | GMM | Epocas | Mejor perdida de validacion |
|---|---|---|---|---|---|
| seed0 | 0,419 | 0,405 | 0,448 | 30 | 0,131 |
| seed1 | 0,433 | 0,397 | 0,427 | 30 | 0,119 |
| seed2 | 0,432 | 0,401 | 0,434 | 30 | 0,132 |

Variables simples sobre los mismos eventos, sin etiquetas y sin entrenamiento:

| Variable | AUC |
|---|---|
| pT medio por particula (HT/N) | 0,811 |
| -tau21 | 0,801 |
| HT | 0,792 |
| mjj | 0,788 |

Un AUC entre 0,40 y 0,44 implica que el autoencoder puntua el fondo como mas anomalo que la senal.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 95.888 parametros y procesa como maximo 48 particulas por evento.
- GPU recomendadas: cualquiera con soporte CUDA, incluidas GTX 1050 Ti, RTX 2060 o superiores; tambien funciona en CPU sin penalizacion apreciable.
- Cabe en cualquier GPU de consumo y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo mediante el paquete `hv_event_ae` incluido en el repositorio; no se proporcionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | AUC (senal W' -> XY) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viverun/lhco-rnd-event-gae | 95.888 | 48 particulas | 0,397-0,448 | MIT | Pesos y codigo publicos |
| Baseline pT medio por particula (HT/N) | 0 | no aplica | 0,811 | no aplica | Variable calculable sin entrenamiento |
| Baseline -tau21 | 0 | no aplica | 0,801 | no aplica | Variable calculable sin entrenamiento |
| Baseline HT | 0 | no aplica | 0,792 | no aplica | Variable calculable sin entrenamiento |
| Baseline mjj | 0 | no aplica | 0,788 | no aplica | Variable calculable sin entrenamiento |

No se dispone de otros autoencoders de grafos comparables con resultados publicados en la informacion proporcionada.

## Limitaciones y advertencias

- No debe usarse como detector de anomalias: sus puntuaciones estan invertidas para la senal objetivo del dataset.
- El AUC inferior a 0,5 indica que el modelo asigna puntuaciones mas altas al fondo que a la senal, un fallo sistematico y no ruido estadistico.
- Sesgo estructural: la perdida de reconstruccion favorece eventos con pocas particulas y pT alto, que en este dataset corresponden a la senal.
- El entrenamiento usa solo fondo QCD; no se probaron otras senales ni otros canales.
- La entrada esta limitada a 48 particulas en el decodificador, aunque el paper uso P = 350; eventos con alta multiplicidad pueden quedar truncados.
- Proyecto discontinuado desde noviembre de 2026; no habra actualizaciones ni soporte.
- La licencia MIT permite uso comercial, pero el autor desaconseja explicitamente su uso como detector en produccion.
- No se han publicado resultados de sesgo, robustez ni latencia en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Viverun/lhco-rnd-event-gae
- Paper: https://doi.org/10.5281/zenodo.23432779
- Codigo: https://github.com/Viverun/Hidden-Vertex
- Resultados de la Parte 3: https://github.com/Viverun/Hidden-Vertex/blob/main/docs/PART3_RESULTS.md
- Cuaderno de resultados en Kaggle: https://www.kaggle.com/code/viveriun/hidden-vertex-gae-results
- Dataset LHC Olympics 2020 R&D: https://zenodo.org/records/2629072
