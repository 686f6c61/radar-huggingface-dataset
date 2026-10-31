# yokko123/ctp-core-penumbra-mjnet

## Resumen

mJ-Net Core / Penumbra (FE3 Encoder) es un modelo de segmentacion sobre imagenes de perfusion por tomografia computarizada (CTP) 4D, publicado por el usuario yokko123 en Hugging Face y presentado en IEEE BHI 2026. Se trata de un port a PyTorch de la arquitectura mJ-Net, una CNN 2D + tiempo que procesa parches de 16×16 pixeles a lo largo de los 40 puntos temporales de un estudio de CTP de admision, y predice una etiqueta de 4 clases por parche: fondo, cerebro, penumbra y nucleo (core) isquemico.

Lo relevante de esta publicacion no es su rendimiento como segmentador —que es deliberadamente modesto—, sino su uso como extractor de caracteristicas: el descriptor de 256 dimensiones del cuello de botella del encoder (FE3) ofrecio, segun los autores, la separacion mas clara entre penumbra salvageable y no salvageable de todas las familias de caracteristicas evaluadas en el articulo. El modelo se entreno en una cohorte de 116 casos del Stavanger University Hospital (SUH) y pesa solo 0,98 millones de parametros (19,5 MB los 5 folds), lo que lo hace trivialmente desplegable en CPU.

Para quien busque segmentacion core/penumbra de calidad clinica, los propios autores redirigen a sus pesos nnU-Net (Dice 0,71 / 0,30), dejando este modelo como herramienta de investigacion sobre espacios de caracteristicas en neuroimagen isquemica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mJ-Net (CNN 2D + tiempo, variante estandar, `longJ=False`, `v2=False`), con BatchNorm tras cada convolucion y dropout 0,2 |
| Parametros totales | 978.351 (~0,98 M) |
| Parametros activos | no disponible (no es MoE; todos los parametros son activos) |
| Longitud de contexto | no aplicable (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en precision original, sin cuantizacion publicada) |
| Idiomas soportados | no aplicable (modelo de segmentacion de imagen) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, un fichero por fold, 19,5 MB en total para los 5 folds) |

## Arquitectura y entrenamiento

mJ-Net es una red convolucional que opera sobre tensores de entrada (1, 40, 16, 16): un canal, 40 instantes temporales y un parche espacial de 16×16. La red colapsa el eje temporal y clasifica cada parche en una de 4 clases (fondo, cerebro, penumbra, nucleo). El cuello de botella del encoder produce un descriptor de 256 dimensiones tras mean pooling espacial, que es el elemento central del articulo como caracteristica FE3. La variante publicada es la estandar, con normalizacion BatchNorm tras cada convolucion y dropout de 0,2 en todas las posiciones designadas.

El entrenamiento se realizo con AdamW (lr inicial 1·10⁻³ con planificacion cosenica hasta 1·10⁻⁶, weight decay 10⁻², batch size 32) sobre 116 casos del Stavanger University Hospital. Los parches se muestrearon con stride 4, sobremuestreando 6× los parches que contenian lesion, y con early stopping sobre la metrica de validacion. Se uso un ensemble de 5 folds, cuyos puntos de parada fueron las epocas 23, 17, 9, 26 y 13, muy por debajo del presupuesto de epocas en todos los casos. Los resultados publicados provienen exactamente de estos checkpoints. El modelo se entreno solo con la cohorte SUH; el dataset ISLES'24 enlazado es donde se aplico, no donde se entreno o evaluo.

## Capacidades

- Segmentacion 4 clases sobre CTP 4D de admision: fondo, cerebro, penumbra y nucleo isquemico, con Dice de 0,30 en penumbra y 0,05 en nucleo (rendimiento bajo, reconocido por los autores).
- Extraccion de caracteristicas FE3: descriptor de 256 dimensiones del cuello de botella del encoder, con la mejor separacion entre penumbra salvageable y no salvageable de las familias de caracteristicas probadas en el articulo.
- Procesado de entrada flexible: acepta un NIfTI 4D de CTP con 40 timepoints o un directorio de 40 frames 3D nombrados secuencialmente (`CASE_0000.nii.gz` … `CASE_0039.nii.gz`).
- Control de velocidad/suavizado mediante el parametro `--stride` (por defecto 4) y opcion de ejecutar un solo fold (`--folds 0`) en lugar del ensemble completo.
- Descarga automatica de pesos desde el Hub si se omite el parametro `--weights`.
- Ensemble de 5 folds disponible para inferencia mas robusta.

## Casos de uso

- Extraccion de descriptores FE3 para investigacion en neuroimagen: el caso de uso principal; el script `extract_features.py` del repositorio agrupa el cuello de botella de 256-D por regiones etiquetadas, util para estudiar la salvageabilidad de la penumbra.
- Linea base de segmentacion rapida en CPU: con menos de 1 M de parametros y 19,5 MB de pesos, permite inferencia sin GPU, util para prototipado o revision visual aproximada de estudios CTP.
- Comparacion de arquitecturas en CTP: sirve como baseline ligera frente a nnU-Net (tambien publicado por el mismo autor) en experimentos de segmentacion core/penumbra.
- Desarrollo de pipelines de preprocesado CTP: el modelo exige una cadena concreta (correccion de movimiento, resampleo temporal a 1 fps con 40 frames, registro a NCCT, skull-stripping con SynthStrip, ventaneo [0, 100] HU), lo que lo hace util como test de validacion de pipelines de preprocesado.
- Estudios de espacio latente en modelos medicos: el descriptor 256-D puede alimentar clasificadores posteriores, clustering o analisis de separabilidad entre tejido salvageable y no salvageable.
- Reproduccion del articulo IEEE BHI 2026: pesos, codigo y DOI en Zenodo permiten replicar los resultados del paper.

## Benchmarks y rendimiento

Resultados en el conjunto de test reservado (33 casos), publicados en la model card:

| Clase | Dice |
|---|---|
| Penumbra | 0,30 ± 0,23 |
| Nucleo (core) | 0,05 ± 0,06 |
| Lesion (nucleo ∪ penumbra) | 0,24 ± 0,20 |

Como referencia, los pesos nnU-Net del mismo autor alcanzan Dice 0,71 (penumbra) y 0,30 (nucleo) sobre los mismos 33 pacientes. Un postprocesado de componentes conexas eleva la penumbra a 0,32 sin afectar al nucleo, pero no se aplica por defecto.

## Requisitos de hardware

- VRAM estimada: no disponible explicitamente; dado el tamano (~0,98 M de parametros, parches de 16×16×40), la inferencia es viable en CPU sin GPU dedicada.
- GPU recomendadas: no necesarias; cualquier GPU moderna sobra con diferencia si se desea acelerar el barrido de parches.
- Consumer GPUs: perfectamente viable en cualquier GPU de consumo (incluso integradas), aunque no aporta ventaja practica.
- Despliegue: PyTorch con `torch`, `SimpleITK` y `numpy`; descarga de pesos via `huggingface_hub`. Existe ademas un Space de demostracion en Hugging Face (ctp-core-penumbra-demo) y pesos nnU-Net alternativos para segmentacion de calidad.
- Latencia y throughput: no disponibles; el parametro `--stride` permite ajustar la relacion velocidad/suavizado del barrido.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Dice penumbra / nucleo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mJ-Net FE3 (este modelo) | 0,98 M | Segmentacion 4 clases + extractor FE3 256-D | 0,30 / 0,05 | MIT | Pesos PyTorch, codigo y demo en HF |
| nnU-Net core/penumbra (mismo autor) | no disponible | Segmentacion core/penumbra | 0,71 / 0,30 | no disponible | Pesos en HF (ctp-core-penumbra-nnunet) |
| Modelos de la challenge ISLES'24 | no disponible | Segmentacion de lesion isquemica en CTP | no disponible | varia | Dataset publico en HF |

## Limitaciones y advertencias

- Rendimiento de segmentacion deliberadamente bajo: Dice 0,05 en nucleo es practicamente inservible y 0,30 en penumbra esta muy por debajo del nnU-Net; los propios autores advierten de que estos pesos no deben usarse como segmentador.
- Contrato de entrada estricto: el modelo no funcionara de forma sensata sobre CTP en bruto; requiere la cadena completa de preprocesado (correccion de movimiento, resampleo a 40 frames a 1 fps, registro a NCCT, SynthStrip, ventaneo [0, 100] HU).
- Sesgo de cohorte: entrenado unicamente con 116 casos del Stavanger University Hospital; la generalizacion a otros escanners, protocolos de CTP o poblaciones no esta garantizada ni documentada.
- Riesgo de uso clinico: no hay validacion clinica publicada para uso asistencial; no debe emplearse en entornos de decision medica sin validacion local rigurosa.
- El script `predict.py` no reproduce la extraccion del descriptor FE3 (el aporte principal); para ello hay que usar el script `extract_features.py` del repositorio de codigo.
- Licencia MIT sin restricciones de uso comercial, pero al tratarse de un modelo medico, las regulaciones locales (MDR europeo, FDA) pueden aplicar al uso final.
- Comunidad muy reducida (48 descargas, 1 like), sin historial de auditoria externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yokko123/ctp-core-penumbra-mjnet
- Paper (arXiv): https://arxiv.org/abs/2602.07535
- Pagina del proyecto: https://yokko123.github.io/bi-temporal-ctp-dwi/
- Codigo (GitHub): https://github.com/yokko123/bi-temporal-ctp-dwi-code
- Script de extraccion FE3: https://github.com/yokko123/bi-temporal-ctp-dwi-code/blob/main/02_features/fe3_mjnet/extract_features.py
- Pesos nnU-Net alternativos: https://huggingface.co/yokko123/ctp-core-penumbra-nnunet
- Demo en vivo (HF Space): https://huggingface.co/spaces/yokko123/ctp-core-penumbra-demo
- DOI (Zenodo): https://doi.org/10.5281/zenodo.23209370
- Dataset ISLES'24 (aplicacion, no entrenamiento): https://huggingface.co/datasets/hugging-science/isles24-stroke
- Referencias adicionales citadas en tags: arXiv 2104.03002 (https://arxiv.org/abs/2104.03002) y arXiv 2303.08757 (https://arxiv.org/abs/2303.08757)
