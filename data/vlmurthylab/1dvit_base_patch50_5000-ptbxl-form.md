# vlmurthylab/1dvit_base_patch50_5000.ptbxl-form

## Resumen

`1dvit_base_patch50_5000.ptbxl-form` es un codificador Vision Transformer (ViT) adaptado a senal 1D para electrocardiograma (ECG), con 92.704.019 parametros y pesos en safetensors. Lo desarrollo originalmente el laboratorio 4dm-labs y esta publicacion de `vlmurthylab` es un espejo sin cambios del repositorio original, redistribuido bajo licencia Apache-2.0. Acompana al proyecto ECGFlow, presentado en NEJM AI 2025 (Moody JB, et al.; doi:10.1056/AIoa2500164), por lo que no es un modelo de proposito general sino un componente de un pipeline de investigacion cardiovascular.

El nombre codifica la configuracion: arquitectura ViT de tamano "base", parche de 50 muestras y ventana de 5000 muestras, entrenada sobre el conjunto de datos PTB-XL (que corresponde a registros de 10 segundos a 500 Hz, es decir, 5000 puntos por derivacion). El sufijo `-form` no esta documentado en la informacion disponible. Con parche de 50 sobre 5000 muestras, la secuencia de entrada resultante seria de 100 tokens, una longitud muy corta que hace el modelo computacionalmente muy ligero en inferencia.

Su relevancia es de nicho: sirve como extractor de representaciones o cabecera de clasificacion para tareas de ECG (ritmo, morfologia, patologia) dentro de un flujo de trabajo de investigacion reproducible, y como referencia para quien quiera replicar o auditar el pipeline ECGFlow. No hay pipeline declarado, cero descargas, cero "likes" y ninguna metrica publicada en la informacion disponible, asi que debe tratarse como un artefacto de investigacion, no como un modelo listo para produccion clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) adaptado a entrada 1D; variante "base"; patch size 50 sobre ventana de 5000 muestras (inferido del nombre del repositorio) |
| Parametros totales | 92.704.019 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; la entrada es una ventana fija de 5000 muestras de ECG (10 s a 500 Hz), equivalente a ~100 tokens con parche de 50 |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en safetensors (tamano de repo 0,4 GB, compatible con fp32) |
| Idiomas soportados | no disponible (modelo sobre senal fisiologica, no sobre texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer tipo ViT aplicado a una senal temporal 1D en lugar de a una imagen. La senal se divide en parches no solapados de 50 muestras, se proyecta cada parche a la dimension del modelo y se procesa con bloques de autoatencion. Con una ventana de 5000 muestras y parche de 50, la secuencia resultante es de aproximadamente 100 tokens, muy por debajo de las longitudes habituales en ViT de imagen, lo que reduce el coste de atencion de forma cuadratica y hace el modelo muy barato de ejecutar. El detalle exacto de dimension oculta, numero de capas, cabezas y si se anaden embeddings posicionales 1D no esta disponible en la informacion proporcionada.

El entrenamiento se asocia al conjunto PTB-XL, segun indica el propio nombre del checkpoint. No se especifican en la informacion disponible el numero de tokens o muestras vistas, la composicion exacta del dataset, el regimen de preentrenamiento (supervisado, contrastivo o autosupervisado), ni si hubo ajuste fino con RLHF/DPO (algo que, por otra parte, no aplica a un modelo sobre senal). El sufijo "form" sugiere una variante o formato de entrada concreto dentro de la familia de checkpoints, pero su significado no esta documentado. El modelo es un espejo: no se han introducido cambios respecto al original de 4dm-labs.

## Capacidades

- Extraccion de caracteristicas y representaciones latentes de registros de ECG de 10 segundos (5000 muestras) mediante un encoder ViT 1D.
- Clasificacion o regresion sobre ECG cuando se le anade una cabeza de tarea, en el contexto del pipeline ECGFlow.
- Procesamiento de senal de una unica derivacion o de un formato concreto de entrada (no documentado) por registro.
- No es un modelo generativo de texto: no soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingues, de vision natural, audio ni modo "thinking".
- Integrable como modulo PyTorch dentro de pipelines de investigacion existentes.

## Casos de uso

- Investigacion en clasificacion de ritmo cardiaco: usar el encoder como extractor de embeddings de registros PTB-XL y entrenar una regresion logistica o un MLP ligero encima para tareas como deteccion de fibrilacion auricular o bloqueos de rama, aprovechando que el backbone ya esta preentrenado en ese dominio.
- Reproduccion de resultados de ECGFlow: cargar este checkpoint exacto para replicar las cifras del articulo de NEJM AI 2025 y verificar la reproducibilidad del pipeline antes de construir variantes propias.
- Baseline en estudios comparativos de arquitecturas: al ser un ViT 1D de 92,7 M de parametros con entrada de ~100 tokens, sirve como referencia ligera frente a CNN 1D (tipo xresnet1d) o modelos tipo wav2vec2 aplicados a ECG.
- Aprendizaje autosupervisado o destilacion: congelar el encoder y usarlo como profesor o como inicializacion en datasets de ECG mas pequenos, donde entrenar desde cero llevaria a sobreajuste.
- Prototipado en CPU: la ventana de entrada es tan corta y el modelo tan pequeno que la inferencia por registro es viable en CPU, lo que permite experimentar en portatiles o en entornos sin GPU.
- Auditoria y trazabilidad de modelos medicos: al ser un espejo con licencia Apache-2.0 y pesos en safetensors, encaja en revisiones de terceros que necesiten verificar pesos y licencia de un componente usado en publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 0,37 GB (92,7 M de parametros); en fp16, unos 0,19 GB. Con activaciones y un lote moderado, el consumo se mantiene por debajo de 1-2 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4090, T4, L4 o incluso una GPU integrada reciente cubren el caso de uso sin problema.
- Cabe en GPU consumer: si, con amplio margen; tambien es viable en CPU para inferencia por registro, dado el reducido numero de tokens de entrada.
- Opciones de despliegue: PyTorch con safetensors como via natural; exportacion a ONNX o TorchScript para serving. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no aplican directamente sin conversion previa (y no tendrian sentido para una entrada de senal, no de texto). vLLM y TGI estan orientados a modelos de lenguaje y no son adecuados aqui.
- Latencia y throughput: no hay mediciones publicadas. Por el tamano del modelo y la longitud de secuencia (~100 tokens) se espera una latencia del orden de milisegundos por registro en GPU consumer y de decenas de milisegundos en CPU, pero son estimaciones cualitativas, no cifras oficiales.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados ni especificaciones de modelos comparables, por lo que no es posible una comparacion cuantitativa fiable.

| Modelo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| 1dvit_base_patch50_5000.ptbxl-form (este modelo) | 92.704.019 | 5000 muestras de ECG, parche de 50 | Apache-2.0 | safetensors en HuggingFace (espejo) |
| Alternativas 1D-CNN para ECG (familia xresnet1d) | no disponible | no disponible | no disponible | no disponible |
| Alternativas tipo wav2vec2 aplicadas a ECG | no disponible | no disponible | no disponible | no disponible |
| Otros ViT 1D preentrenados en PTB-XL | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigacion, no validado como producto sanitario. No debe usarse para diagnostico clinico sin validacion regulatoria y estudio prospectivo.
- Dominio muy restringido: entrenado sobre PTB-XL y sobre un formato de senal concreto; el rendimiento fuera de ese formato (otras frecuencias de muestreo, otras derivaciones, dispositivos ambulatorios, wearables) es desconocido y probablemente degrade.
- Sin model card detallada: se desconoce la composicion exacta del dataset de entrenamiento, el regimen de preentrenamiento y las metricas. Esto impide evaluar sesgos demograficos o de subpoblacion (edad, sexo, etnia, comorbilidades), que en ECG son un riesgo conocido.
- Riesgo de falsos negativos y falsos positivos silenciosos: al no haber benchmarks publicados, no hay estimacion de sensibilidad ni especificidad.
- Entrada de longitud fija: la ventana de 5000 muestras condiciona el uso; senales mas cortas o mas largas requieren remuestreo o padding, con impacto desconocido en la calidad de las representaciones.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero la licencia del modelo no cubre las obligaciones regulatorias del uso clinico ni los derechos sobre los datos de entrenamiento originales.
- Es un espejo sin mantenimiento declarado, con 0 descargas y 0 "likes"; conviene referenciar el repositorio original de 4dm-labs para issues y actualizaciones.
- Fecha de creacion del repositorio en HuggingFace: 2026-10-17, posterior a la publicacion del articulo; verificar que los pesos corresponden realmente a la version evaluada en el paper.

## Enlaces

- HuggingFace (espejo): https://huggingface.co/vlmurthylab/1dvit_base_patch50_5000.ptbxl-form
- Repositorio original en HuggingFace: https://huggingface.co/4dm-labs/1dvit_base_patch50_5000.ptbxl-form
- Codigo y descripcion de ECGFlow (4dm-labs): https://github.com/4dm-labs/ecgflow
- Espejo del codigo citado en la model card: https://github.com/vlmurthylab/ecgflow
- Articulo: Moody JB, et al. NEJM AI 2025. DOI: https://doi.org/10.1056/AIoa2500164
