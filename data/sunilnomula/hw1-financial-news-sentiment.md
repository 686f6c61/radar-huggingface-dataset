# sunilnomula/HW1-financial-news-sentiment

## Resumen

`sunilnomula/HW1-financial-news-sentiment` no es un modelo de red neuronal, sino un ejercicio academico (identificado como "HW1") que implementa y compara cuatro sistemas de analisis de sentimiento basados en lexicones y reglas sobre titulares de noticias financieras. El objetivo del autor es comprobar si una puntuacion lexica sencilla puede anticipar el signo del rendimiento bursatil del dia siguiente, es decir, una tarea de clasificacion binaria entre retorno positivo (`1`) y negativo (`-1`).

El repositorio pesa 0,1 GB e incluye un cuaderno de Jupyter, dos ficheros CSV (`sentiment_predictions.csv` y `model_comparison.csv`) y el propio README; no contiene pesos entrenados en formato safetensors, GGUF ni equivalente. El trabajo se apoya en tres lexicones preexistentes (TextBlob, VADER y Loughran-McDonald) y en un cuarto lexicon creado a mano por el autor con terminos especificos del dominio financiero ("beats estimates", "raises guidance", "profit warning", etc.).

Su relevancia es acotada y de tipo metodologico: sirve como linea base reproducible y como evidencia empirica del compromiso precision-exhaustividad en el analisis de sentimiento financiero. Con un umbral de confianza de 0,75 el lexicon propio alcanza un 68 % de precision sobre el conjunto de inferencia, frente al 61,93 % de la linea base con VADER, pero a costa de una exhaustividad del 2,31 %. No tiene ficha de pipeline, licencia, idiomas ni etiquetas declaradas mas alla de `region:us`, y no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable: sistema basado en lexicones y reglas (sin red neuronal, sin transformer) |
| Parametros totales | No aplicable (no existen pesos entrenados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplicable: procesamiento por titular individual, sin ventana de contexto |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No disponible en la ficha; los lexicones empleados (TextBlob, VADER, Loughran-McDonald) estan orientados a texto ingles |
| Licencia | No disponible |
| Formato de pesos | No aplicable; el repositorio contiene un cuaderno `.ipynb`, `sentiment_predictions.csv`, `model_comparison.csv` y `README.md` |
| Autor | sunilnomula |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Etiquetas declaradas | `region:us` |
| Tarea | Clasificacion binaria de sentimiento (positivo / negativo) sobre titulares financieros |
| Volumen de datos | 84.643 titulares de entrenamiento, 4.811 de prueba, 2.397 reservados para inferencia |

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni fase de entrenamiento por descenso de gradiente. El sistema es un clasificador determinista que combina tres componentes: normalizacion del texto, puntuacion lexica y umbral de decision. La normalizacion aplicada a los titulares consiste en convertir a minusculas, eliminar puntuacion y etiquetas tipo HTML, suprimir frases de relleno habituales en servicios de noticias y eliminar el ticker de la propia empresa mencionada para evitar fuga de identificador. Como excepcion deliberada, se conservan las negaciones ("not", "never") porque su eliminacion invertiria el significado del titular.

Los cuatro sistemas comparados son TextBlob, VADER con terminos financieros anadidos, el lexicon Loughran-McDonald (disenado especificamente para texto financiero) y un lexicon personalizado construido a mano con expresiones que mueven mercado ("beats estimates", "raises guidance", "misses estimates", "cuts guidance", "profit warning", "weak demand") y gestion basica de negacion, de modo que "not weak demand" no se puntua como negativo. El unico hiperparametro relevante es el umbral de confianza, evaluado en 0 y en 0,75.

Las etiquetas de supervision no proceden del texto, sino del resultado de mercado del dia siguiente: `1` si el retorno fue positivo, `-1` si fue negativo. No se documenta ningun tipo de ajuste fino, RLHF, DPO ni destilacion.

## Capacidades

- Clasificacion de sentimiento binaria (positiva / negativa) de titulares de noticias financieras.
- Puntuacion lexica especifica del dominio financiero mediante terminos como "beats estimates" o "cuts guidance".
- Manejo basico de negaciones para evitar inversiones de polaridad.
- Umbral de confianza configurable para desplazar el punto de operacion entre precision y exhaustividad.
- Normalizacion de texto orientada a titulares: minusculas, limpieza de puntuacion, eliminacion de relleno y de tickers.
- Comparacion reproducible de cuatro estrategias de sentimiento sobre el mismo conjunto de datos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, ni generacion de texto libre.
- No dispone de modo "thinking" ni de capacidades multilingues declaradas.

## Casos de uso

- Filtrado de senales de alta confianza para trading: con el umbral en 0,75 el sistema solo marca como positivos aquellos titulares en los que el lexicon tiene alta certeza, lo que permite generar alertas de baja tasa de falsos positivos aunque se pierdan la mayoria de las senales reales.
- Monitorizacion en tiempo real de flujos de noticias: al no requerir GPU ni pesos, puede integrarse en un proceso ligero que consuma un feed RSS o una API de noticias y etiquete cada titular en el momento.
- Generacion de variables para modelos cuantitativos: el score de sentimiento puede incorporarse como feature adicional en un modelo de prediccion de retornos, junto a factores tecnicos o fundamentales.
- Docencia e investigacion reproducible: sirve como linea base metodologica para asignaturas de procesamiento de lenguaje natural financiero, ya que el cuaderno documenta limpieza, lexicones y evaluacion paso a paso.
- Auditoria comparativa de lexicones: permite medir, sobre un corpus etiquetado por retorno real, si un lexicon generico (TextBlob, VADER) o uno especifico (Loughran-McDonald, propio) se comporta mejor en un dominio concreto.
- Preetiquetado de corpus: las predicciones de alta confianza pueden usarse como semilla para etiquetar grandes volumenes de titulares antes de entrenar un modelo supervisado mas costoso.
- Backtesting de estrategias de sentimiento: el fichero `sentiment_predictions.csv` permite reconstruir la senal y evaluar su comportamiento historico antes de comprometer capital.

## Benchmarks y rendimiento

Los unicos resultados publicados son las precisiones sobre la clase positiva reportadas por el autor. No se incluyen MMLU, HumanEval, GSM8K ni metricas equivalentes, que no aplican a este tipo de sistema.

| Modelo | Precision en prueba (positivo) | Precision en inferencia (positivo) |
|---|---|---|
| TextBlob | 50,33 % | 61,69 % |
| VADER | 51,05 % | 61,93 % |
| Loughran-McDonald | 51,25 % | 61,93 % |
| Lexicon propio (umbral 0) | 51,37 % | 61,89 % |
| Lexicon propio (umbral 0,75) | 54,05 % | 68,00 % |

Con umbral 0,75 el sistema solo marco 50 titulares como positivos sobre el conjunto de inferencia, lo que equivale a una exhaustividad del 2,31 %. La ganancia de unos 6 puntos porcentuales de precision respecto a la linea base VADER se obtiene, por tanto, a costa de descartar la practica totalidad de las senales positivas. No se reportan exhaustividad por clase, F1, exactitud global ni intervalos de confianza.

## Requisitos de hardware

- VRAM para inferencia: no aplicable; el sistema no usa GPU ni ejecuta operaciones tensoriales.
- GPU recomendadas: ninguna. El procesamiento es de CPU y consiste en busqueda de terminos y aplicacion de reglas.
- Compatibilidad con GPU de consumo: irrelevante, funciona en cualquier maquina capaz de ejecutar Python.
- Opciones de despliegue: ejecucion directa del cuaderno `.ipynb` o scripts de Python con TextBlob, VADER y los diccionarios Loughran-McDonald; no aplican vLLM, llama.cpp, Ollama ni TGI porque no hay pesos de modelo.
- Huella en disco: el repositorio completo ocupa 0,1 GB, mayoritariamente datos y cuaderno.
- Latencia y throughput: no se han publicado mediciones. Al ser un metodo lexico, el coste por titular es lineal respecto al numero de tokens del texto y no depende de un acelerador.

## Comparativa con modelos similares

La comparacion natural es contra los propios sistemas evaluados en el trabajo, ya que el repositorio no es un modelo neuronal equiparable a otros publicados en HuggingFace.

| Sistema | Tipo | Precision en inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lexicon propio (umbral 0,75) | Lexicon + reglas | 68,00 % | No disponible | Repositorio HuggingFace |
| VADER con terminos financieros | Lexicon + reglas | 61,93 % | No disponible en la ficha | Libreria externa |
| Loughran-McDonald | Lexicon financiero | 61,93 % | No disponible en la ficha | Diccionario externo |
| TextBlob | Lexicon generico | 61,69 % | No disponible en la ficha | Libreria externa |

No se dispone de comparaciones frente a modelos neuronales de sentimiento financiero (por ejemplo, modelos tipo FinBERT) en la informacion proporcionada.

## Limitaciones y advertencias

- No existen pesos entrenados: el artefacto es un cuaderno y dos CSV, por lo que no puede cargarse como un modelo al uso (`from_pretrained` no aplica).
- Licencia no declarada: no puede asumirse uso comercial ni redistribucion sin consultar al autor.
- Idiomas no declarados: los lexicones utilizados estan disenados para ingles financiero, por lo que su aplicacion a otros idiomas no esta validada.
- Exhaustividad muy baja en el punto de operacion recomendado (2,31 % con umbral 0,75): el sistema es conservador y se pierde la mayor parte de las senales positivas.
- Precision modesta incluso en el mejor caso (68 % en inferencia): un tercio de las senales positivas emitidas son incorrectas.
- Rendimiento cercano al azar en el conjunto de prueba (entre 50,33 % y 54,05 %), lo que sugiere poca capacidad de generalizacion fuera del reparto de inferencia.
- Riesgo de sobreajuste del umbral: el valor 0,75 se selecciona tras observar los resultados, sin validacion cruzada documentada, por lo que la ganancia de precision podria no replicarse.
- Dependencia del preprocesado: la eliminacion del ticker y de frases de relleno se aplica de forma manual y podria no trasladarse limpiamente a otros corpus de noticias.
- Sensibilidad a negaciones y matices: aunque se conserva "not", la gestion de la negacion es basica y no cubre construcciones complejas.
- Sesgo de supervivencia en las etiquetas: el etiquetado depende del retorno del dia siguiente, una senal muy ruidosa, lo que introduce un techo estructural a la precision alcanzable.
- Sin validacion sobre mercados, periodos o idiomas distintos al corpus de la asignatura.
- El repositorio no ha recibido descargas ni valoraciones, por lo que no existe validacion independiente de los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/sunilnomula/HW1-financial-news-sentiment
- No se han encontrado en la busqueda web enlaces relevantes al modelo (papers, blogs, repositorios o demos). Los resultados devueltos corresponden a paginas de inicio de sesion de Outlook, sin relacion con el artefacto.
