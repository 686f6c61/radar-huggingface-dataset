# ununununununununununununununununununun/breast-cancer-wisconsin-phi-lattice

## Resumen

`breast-cancer-wisconsin-phi-lattice` es un clasificador tabular de diagnostico de cancer de mama entrenado sobre el conjunto de datos Breast Cancer Wisconsin (Diagnostic), que contiene 30 caracteristicas morfologicas de nucleos celulares obtenidas por biopsia. El modelo ha sido publicado por el usuario `ununununununununununununununununununun` con el objetivo declarado de probar cuantizacion extrema a 2 bits y robustez frente a ruido, no como un producto listo para uso clinico.

La innovacion principal es el uso de una cuantizacion denominada `phi-lattice` a 2 bits, que segun la model card alcanza una relacion senal-ruido de cuantizacion (SQNR) de 7,85 dB frente a los 5,27 dB de una cuantizacion uniforme estandar del mismo ancho de bit. El modelo se distribuye en formato `safetensors` y ademas incluye una version empaquetada en `uint8` con cuatro pesos por byte, lo que reduce el tamano aproximadamente 10,7 veces respecto a FP32.

No se trata de un modelo de lenguaje ni de un transformer generativo: es un clasificador tabular binario (maligno/benigno) de proposito muy especifico, con licencia MIT y un repositorio de tamano practicamente nulo. Su relevancia es experimental, como banco de pruebas de tecnicas de cuantizacion extrema en modelos pequenos de ambito medico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador tabular (no se especifica la topologia interna en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada tabular de 30 caracteristicas, no secuencial) |
| Tipos de cuantizacion | 2 bits mediante `phi-lattice`; pesos empaquetados en `uint8` (4 pesos por byte) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`model.safetensors`) y PyTorch bit-packed (`model_phi_packed_2bit.pt`) |

## Arquitectura y entrenamiento

La model card no detalla la topologia interna del clasificador (numero de capas, dimensiones ocultas ni funcion de activacion). Lo que si se especifica es que la entrada son 30 caracteristicas de biopsia normalizadas mediante un `StandardScaler` cuyos parametros se incluyen en el `config.json`. La salida es una clasificacion binaria sobre el dataset Breast Cancer Wisconsin (Diagnostic).

El entrenamiento se realizo sobre dicho dataset y el trabajo se centra en la fase de compresion: se aplica cuantizacion `phi-lattice` a 2 bits, con un 46,9 % de pesos anulados (sparsity), y se compara contra una cuantizacion uniforme de 2 bits (69,4 % de pesos anulados) y contra el modelo base en FP32. No se documentan en la informacion disponible el numero de ejemplos, el particionado train/test, ni si hubo ajuste fino posterior a la cuantizacion.

## Capacidades

- Clasificacion binaria tabular de muestras de biopsia de mama a partir de 30 caracteristicas de nucleos celulares.
- Inferencia con pesos cuantizados a 2 bits, incluyendo una variante empaquetada en `uint8` para despliegue de muy bajo peso.
- Robustez declarada frente a ruido gaussiano en la entrada (sigma=0,6) superior a la del modelo base y a la cuantizacion uniforme.
- Normalizacion de caracteristicas integrada mediante parametros `StandardScaler` en el `config.json`.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni agentes.
- No tiene capacidades multilingues: no procesa lenguaje natural.

## Casos de uso

- Investigacion en cuantizacion extrema: servir como referencia reproducible para comparar `phi-lattice` a 2 bits frente a cuantizacion uniforme en un clasificador medico pequeno, usando la tabla de SQNR y precision incluida en la model card.
- Docencia y experimentacion en compresion de modelos: el par de ficheros (`safetensors` y `uint8` empaquetado) permite estudiar el impacto del empaquetado de pesos en tamano y latencia sin necesidad de infraestructura GPU.
- Pruebas de robustez frente a ruido: el benchmark con sigma=0,6 permite evaluar tecnicas de regularizacion o aumento de datos en clasificadores tabulares medicos.
- Prototipado de pipelines de clasificacion tabular: integrar el modelo en un script de scikit-learn/PyTorch para validar el flujo de normalizacion, carga de pesos y prediccion antes de escalar a un modelo mayor.
- Evaluacion de despliegue en entornos con memoria muy limitada: la variante empaquetada de 2 bits reduce el tamano de pesos aproximadamente 10,7 veces frente a FP32, util para simulaciones en dispositivos embebidos.
- Referencia comparativa en articulos o tesis sobre cuantizacion: citar las cifras de precision limpia (95,80 %) y con ruido (93,01 %) como linea base en estudios de compresion.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de prueba:

| Variante | Bits | SQNR de pesos (dB) | Peso anulado (sparsity) | Precision limpia | Precision con ruido (sigma=0,6) |
|---|---|---|---|---|---|
| Baseline (FP32) | 32 | Referencia | 0,0 % | 95,10 % | 92,31 % |
| Uniforme estandar | 2 | 5,27 | 69,4 % | 95,80 % | 91,61 % |
| `phi-lattice` (este repo) | 2 | 7,85 (+2,58) | 46,9 % | 95,80 % | 93,01 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar de clasificacion (matriz de confusion, F1, AUC-ROC) ni comparaciones con otros modelos tabulares de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0,0 GB y la variante empaquetada es aproximadamente 10,7 veces menor que FP32, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos unos pocos cientos de MB libres; no se requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1050, RTX 3050, RTX 4090, etc.), y tambien en CPU.
- Opciones de despliegue: carga directa con `safetensors` y PyTorch; la variante `model_phi_packed_2bit.pt` requiere codigo de desempaquetado propio (no se documenta en la model card). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `breast-cancer-wisconsin-phi-lattice` | no disponible | no aplica (tabular) | 95,80 % limpia / 93,01 % con ruido | MIT | HuggingFace |
| Baseline FP32 del mismo autor | no disponible | no aplica | 95,10 % / 92,31 % | MIT (implicita) | Incluido como referencia en la model card |
| Cuantizacion uniforme 2 bits del mismo autor | no disponible | no aplica | 95,80 % / 91,61 % | MIT (implicita) | Incluido como referencia en la model card |

No se dispone de informacion sobre otros clasificadores tabulares publicos comparables (por ejemplo, variantes de scikit-learn o XGBoost sobre el mismo dataset) en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo de proposito experimental: el propio autor lo publica "para probar cuantizacion extrema a 2 bits y robustez frente a ruido", no para uso clinico.
- No debe emplearse en diagnostico medico real: no hay validacion externa, ni analisis de sesgos, ni certificacion regulatoria.
- No se documenta la topologia interna ni el proceso de entrenamiento, lo que dificulta la reproducibilidad.
- La cuantizacion a 2 bits con un 46,9 % de pesos anulados puede degradar el rendimiento fuera de la distribucion del dataset de entrenamiento.
- El benchmark de ruido se limita a un unico valor de sigma (0,6); no se aportan curvas completas de robustez.
- No se especifican los idiomas ni se aplica, ya que el modelo no procesa texto.
- La licencia MIT permite uso comercial, pero la ausencia de validacion clinica desaconseja cualquier aplicacion en produccion sanitaria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ununununununununununununununununununun/breast-cancer-wisconsin-phi-lattice
- Dataset Breast Cancer Wisconsin (Diagnostic): no disponible en la informacion proporcionada
- Paper o blog sobre `phi-lattice`: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
