# xyloslabs/dna-promoter-classifier

## Resumen

dna-promoter-classifier es un clasificador de machine learning desarrollado por Xylos Labs que predice si una secuencia de ADN de *E. coli* de 81 pares de bases actúa como promotor sigma70 o como secuencia no promotora. A diferencia de los grandes modelos genomicos basados en transformers, este clasificador emplea LightGBM, un algoritmo de gradient boosting sobre arboles de decision, combinado con 5.190 caracteristicas artesanales derivadas de la secuencia (frecuencias de k-mers, ventanas posicionales, una matriz de puntuacion especifica de posicion y contenido GC).

El modelo esta disenado para ejecutarse exclusivamente en CPU: el entrenamiento completo tarda aproximadamente 35 segundos en un procesador de 4 nucleos, lo que lo hace accesible para laboratorios sin infraestructura GPU. El paquete se distribuye como un archivo joblib que contiene el clasificador entrenado junto con el objeto PSSM necesario para la extraccion de caracteristicas, y requiere el paquete `dna_promoter` del repositorio GitHub para cargarse y utilizarse.

Su relevancia radica en la combinacion de un rendimiento competitivo en el conjunto de test interno (ROC-AUC de 0,957) con una transparencia poco habitual: el autor documenta explicitamente que en el conjunto independiente `test_sigma70` el modelo obtiene solo un 65,1% de precision y 0,681 de ROC-AUC, por debajo de BACPRO-ML. Esta honestidad sobre las limitaciones de generalizacion lo convierte en una referencia util para entender el estado real de los clasificadores ligeros de promotores bacterianos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre arboles de decision), 300 rondas |
| Parametros totales | no disponible (no es una red neuronal; numero de arboles y hojas no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 81 pb de ADN |
| Tipos de cuantizacion | no aplica (modelo joblib de LightGBM) |
| Idiomas soportados | en (documentacion; la entrada es secuencia de ADN, no texto) |
| Licencia | MIT |
| Formato de pesos | joblib (`best_model.joblib`, diccionario con modelo, PSSM y metadatos) |

## Arquitectura y entrenamiento

El modelo no es una red neuronal sino un clasificador LightGBM de 300 rondas entrenado sobre 5.190 caracteristicas artesanales extraidas de cada secuencia de 81 pb. Estas caracteristicas incluyen frecuencias globales de k-mers para k = 3, 4 y 6; 4-mers en ventana sobre tres ventanas de 27 pb; una matriz de puntuacion especifica de posicion (PSSM) de 5 caracteristicas ajustada unicamente sobre los promotores de entrenamiento; y contenido GC. El archivo joblib empaqueta el clasificador, el objeto PSSM ajustado, la lista de valores de k, las ventanas, la dimension de caracteristicas y la semilla aleatoria.

Los datos de entrenamiento provienen del benchmark iPromoter-2L (Liu et al., *Bioinformatics*, 2018), descontaminado contra el conjunto externo `test_sigma70` eliminando 762 promotores solapados. El conjunto final contiene 932 promotores y 2.860 no promotores, dividido de forma estratificada 70/15/15 con semilla 42. No se menciona uso de RLHF, DPO ni tecnicas de aumento de datos; el entrenamiento es supervisado clasico con validacion cruzada estratificada.

## Capacidades

- Clasificacion binaria de secuencias de ADN de *E. coli* de 81 pb en promotor sigma70 o no promotor, con salida de probabilidad.
- Extraccion de caracteristicas de secuencia mediante k-mers (k = 3, 4, 6), ventanas posicionales de 27 pb, PSSM y contenido GC.
- Validacion de secuencias de entrada mediante la funcion `validate_sequence` del paquete `dna_promoter`.
- Inferencia exclusiva en CPU, sin requisitos de GPU.
- Entrenamiento reproducible en aproximadamente 35 segundos en 4 nucleos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues; es un clasificador especializado de un unico dominio.

## Casos de uso

- Anotacion de genomas bacterianos: el modelo puede procesar ventanas deslizantes de 81 pb a lo largo de un genoma de *E. coli* para generar un perfil de probabilidad de promotor que ayude a localizar sitios de inicio de transcripcion candidatos, gracias a su inferencia en CPU y bajo coste computacional.
- Filtrado previo en pipelines de biologia sintetica: antes de construir un vector de expresion, se puede evaluar la probabilidad de que una region 5' disenada actue como promotor sigma70, descartando candidatos con baja puntuacion antes de validacion experimental.
- Docencia y prototipado rapido: al entrenarse en 35 segundos y ejecutarse en CPU, el modelo sirve como ejemplo reproducible de extraccion de caracteristicas de secuencia y gradient boosting en cursos de bioinformatica.
- Benchmarking de clasificadores de promotores: sus metricas documentadas en el conjunto interno y en `test_sigma70` permiten comparar de forma directa con alternativas como BACPRO-ML o modelos basados en transformers genomicos.
- Analisis de sensibilidad de mutaciones: aplicando mutaciones puntuales sobre una secuencia de 81 pb y recalculando la probabilidad, se pueden identificar posiciones criticas para la funcion promotora, aunque con las reservas de generalizacion documentadas.
- Integracion en herramientas de escritorio o servidores modestos: al no requerir GPU ni descargas de pesos de gran tamano (el repositorio ocupa 0,0 GB), puede embeberse en aplicaciones locales de analisis de secuencias.

## Benchmarks y rendimiento

Resultados en el conjunto de test reservado (n = 569), segun la model card:

| Modelo | Accuracy | ROC-AUC | MCC | Sensibilidad | Especificidad |
|---|---|---|---|---|---|
| Regresion logistica | 0,879 | 0,929 | 0,668 | 0,729 | 0,928 |
| Random Forest | 0,886 | 0,945 | 0,674 | 0,607 | 0,977 |
| XGBoost | 0,914 | 0,949 | 0,760 | 0,757 | 0,965 |
| LightGBM (distribuido) | 0,907 | 0,957 | 0,741 | 0,750 | 0,958 |

En el conjunto independiente `test_sigma70` (n = 1.864), el modelo obtiene 65,1% de accuracy y 0,681 de ROC-AUC, frente al 83,8% y 0,914 reportados por BACPRO-ML en el mismo conjunto. Las metricas completas, ablaciones y evaluacion en el conjunto independiente estan en `metrics.json` y en `RESULTS.md` del repositorio GitHub.

## Requisitos de hardware

- VRAM: no aplica; el modelo no usa GPU.
- CPU: entrenamiento completo en aproximadamente 35 segundos en 4 nucleos; inferencia practicamente instantanea por secuencia.
- GPU recomendadas: ninguna; el modelo esta disenado para CPU.
- Cabe en cualquier equipo consumer: si, incluidos portatiles modestos y entornos sin acelerador.
- Opciones de despliegue: carga directa con `joblib` y el paquete `dna_promoter`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no se publican cifras concretas mas alla del tiempo de entrenamiento; la inferencia sobre una secuencia es de orden de milisegundos por la naturaleza de LightGBM.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | ROC-AUC (test interno) | ROC-AUC (test_sigma70) | Licencia |
|---|---|---|---|---|---|---|
| dna-promoter-classifier (LightGBM) | Gradient boosting + caracteristicas artesanales | no disponible | 81 pb fijos | 0,957 | 0,681 | MIT |
| BACPRO-ML | ML con PSSM de RegulonDB y caracteristicas geometricas | no disponible | no disponible | no disponible | 0,914 (reportado) | no disponible |
| iPromoter-2L | Modelo de referencia del benchmark | no disponible | no disponible | no disponible | no disponible | no disponible |
| ProkBERT (Ligeti et al. 2024) | Transformer genomico bacteriano | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con BACPRO-ML es la mas directa segun los datos aportados: el modelo de Xylos Labs queda por debajo en el conjunto independiente, brecha que el autor atribuye al PSSM mas amplio de RegulonDB y a caracteristicas geometricas de BACPRO-ML, y que documenta como trabajo futuro.

## Limitaciones y advertencias

- Generalizacion limitada: el rendimiento cae a 65,1% de accuracy y 0,681 de ROC-AUC en el conjunto independiente `test_sigma70`, muy por debajo del test interno.
- Dominio restringido: solo clasifica promotores sigma70 de *E. coli* en secuencias de 81 pb; no es aplicable a otras especies, otros factores sigma ni longitudes distintas sin reentrenamiento.
- Dependencia del paquete `dna_promoter`: cargar el archivo joblib requiere el paquete del repositorio GitHub, ya que la clase PSSM vive alli; el archivo por si solo no es autosuficiente.
- Licencias de datos: aunque el codigo es MIT, los archivos de datos de entrenamiento tienen sus propias licencias, detalladas en `DATA_SOURCES.md`; es necesario revisarlas antes de uso comercial o redistribucion.
- Sesgos de datos: el conjunto de entrenamiento procede de iPromoter-2L y puede no representar la diversidad de promotores sigma70 en cepas o condiciones no contempladas.
- Riesgo de falsos positivos y negativos: con sensibilidad de 0,750 y especificidad de 0,958 en el test interno, el modelo tiende a ser conservador con los promotores, lo que puede omitir sitios reales.
- Sin soporte de texto, codigo ni tareas generales: no debe evaluarse como modelo de lenguaje; sus capacidades estan acotadas a la clasificacion de secuencias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion independiente por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/xyloslabs/dna-promoter-classifier
- Repositorio GitHub (codigo, evaluacion y tests): https://github.com/Xylos-Labs/dna-promoter-classifier
- Referencia iPromoter-2L: Liu et al., *Bioinformatics*, 2018 (citado en la model card)
- Referencia ProkBERT: Ligeti et al., 2024, bacterial_promoters (citado en la model card)
