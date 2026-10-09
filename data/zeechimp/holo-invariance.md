# zeechimp/holo-invariance

## Resumen

holo-invariance es una herramienta de analisis, no un modelo de lenguaje. Se distribuye como un unico fichero Python de aproximadamente 500 lineas que mide el grupo de invariancia de cualquier modelo: el conjunto de transformaciones de entrada bajo las cuales la operacion del modelo no cambia. El autor es el usuario de HuggingFace zeechimp y se publica bajo licencia Apache 2.0 dentro del repositorio zeechimp/holo-invariance.

El problema que aborda es metodologico. Las pruebas de robustez habituales preguntan si cae la exactitud; la invariancia pregunta si cambia la operacion interna del modelo. Dos modelos con la misma robustez medida en exactitud pueden tener grupos de invariancia completamente distintos, y es ese grupo el que caracteriza que trata el modelo como equivalente. El marco teorico procede de una serie de articulos sobre desajuste entre modo e interfaz, segun la propia model card.

Tecnicamente es una utilidad de evaluacion e interpretabilidad escrita en NumPy, sin dependencias mas alla de numpy y matplotlib, con pipeline declarado como feature-extraction e idioma declarado ingles. Incluye diez transformaciones de texto y seis numericas, una API de Python con las clases InvarianceProbe y compare_models, una interfaz de linea de comandos y una demo con cinco modelos sinteticos. Su relevancia actual es la de ofrecer una metrica alternativa y reproducible para caracterizar modelos antes de desplegarlos, en lugar de limitarse a la caida de exactitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable: no es una red neuronal. Herramienta de analisis en Python puro sobre NumPy |
| Parametros totales | No aplicable (no hay pesos entrenados) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable. La herramienta procesa lotes de textos de entrada que define el usuario |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | Ingles (en), declarado en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplicable. Se distribuye como codigo fuente Python (holo_invariance.py, ~500 lineas) |
| Autor | zeechimp |
| Fecha de creacion | 2026-10-08 |
| Ultima actualizacion | 2026-10-08 |
| Pipeline declarado | feature-extraction |
| Libreria declarada | holo-invariance |
| Dependencias | numpy, matplotlib |
| Metrica declaradas | similarity, decision-change |
| Descargas | 0 |
| Likes | 1 |
| Dataset de entrenamiento | No aplicable (datasets vacio en la model card) |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red. La herramienta implementa un procedimiento de sondeo: dado un modelo cualquiera envuelto como funcion invocable, se le aplican transformaciones de entrada y se comparan las salidas. Para cada transformacion se calculan tres cantidades independientes. mean_similarity es la cercania media continua entre salidas. invariance es la fraccion de ensayos cuya similitud supera un umbral configurable (por defecto se documentan valores como 0,85 o 0,90), y define la pertenencia al grupo. decision_change es la fraccion de ensayos en los que cambio la salida discreta, equivalente funcional a una caida de exactitud.

El conjunto de transformaciones de texto incluye case_flip, case_flip_letters, whitespace, stopword_drop, punct_strip, punct_add, synonym_swap, word_shuffle, char_typo_5pct y length_double. El conjunto numerico incluye permute, scale_1.5, shift_+0.5, sign_flip, noise_0.1 y zero_pad. Las transformaciones personalizadas son funciones que reciben la entrada y un generador aleatorio, lo que permite ampliar el conjunto sin modificar la libreria. Para modelos de lenguaje la propia documentacion advierte de que la comparacion de texto bruto es demasiado estricta y recomienda envolver el modelo con un extractor de caracteristicas mediante wrap_llm y comparar embeddings o distribuciones de tokens.

La salida del sondeo es un vector de invariancia sobre el conjunto de transformaciones, denominado firma del modelo. La herramienta permite guardar el informe en JSON (save_json), trazar la firma como grafico (plot) e imprimir el informe (print). La funcion compare_models agrega varias firmas para comparar modelos entre si mediante similitud centrada, lo que permite agrupar los modelos que se comportan de forma parecida y separar los que difieren.

## Capacidades

- Medicion del grupo de invariancia de un modelo arbitrario, envolviendolo como funcion de Python.
- Calculo separado de tres metricas por transformacion: mean_similarity, invariance y decision_change.
- Umbral de similitud configurable por linea de comandos (--threshold) y en la API (sim_threshold).
- Repeticion de ensayos configurable (n_repeats) para promediar variabilidad estocastica.
- Diez transformaciones de texto y seis numericas predefinidas, listas para usar.
- Definicion de transformaciones personalizadas mediante funciones simples.
- Soporte de modelos de texto, modelos numericos y funciones matematicas arbitrarias.
- Envoltura especifica para modelos de lenguaje (wrap_llm) con funcion de extraccion de caracteristicas.
- Comparacion multi-modelo con similitud centrada mediante compare_models.
- Exportacion de resultados a JSON y generacion de graficos de firma.
- Interfaz de linea de comandos e interfaz programatica en Python.
- No dispone de tool calling, agentes, vision, audio ni modo de razonamiento: no es un modelo generativo.

## Casos de uso

- Auditoria de robustez en produccion: antes de desplegar un clasificador, se ejecuta la herramienta con el conjunto de transformaciones de texto y se obtiene la firma de invariancia. Si el modelo cambia de decision con synonym_swap o char_typo_5pct, se detecta el punto debil antes de la puesta en produccion.
- Seleccion de modelo entre candidatos: con compare_models se calculan las firmas de dos o tres clasificadores candidatos y se comprueba cual de ellos agrupa mejor las transformaciones que el dominio real exige ignorar, por ejemplo erratas de teclado o puntuacion irregular.
- Deteccion de atajos espureos: un modelo que resulta invariante a word_shuffle y stopword_drop pero muy sensible a synonym_swap esta explotando coincidencia literal de palabras clave en lugar de semantica, algo habitual en tareas de intencion o moderacion.
- Analisis de modelos numericos fisicos: para funciones como f(x) = suma de x cuadrados se verifica que el modelo es invariante a permutacion, cambio de signo y relleno de ceros, y que no lo es a desplazamiento aditivo ni a reescalado, lo que ayuda a documentar supuestos de un modulo de calculo.
- Diagnostico de separabilidad entre operacion y decision: el caso noise_0.1 de la demo muestra una funcion estable en operacion (similitud 0,97) cuyo readout discreto cambia en el 48 por ciento de los ensayos. Es util para distinguir modelos con salida inestable por calibracion de aquellos con representacion interna inestable.
- Investigacion en interpretabilidad y publicacion de resultados: las firmas exportadas a JSON permiten comparar modelos entre experimentos y citar el vector de invariancia como evidencia cuantitativa en un articulo.
- Docencia: la demo con ExactMatch, Concept, LengthOnly y Random sirve como ejercicio practico para ilustrar que la exactitud por si sola no caracteriza un modelo.
- Regresion continua en un pipeline de ML: al integrar la herramienta en integracion continua, cada nueva version del modelo genera una firma que se compara con la anterior, de modo que un cambio no intencionado en el grupo de invariancia dispara una alerta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable porque la herramienta no es un modelo de lenguaje. La model card si incluye los resultados de la demo sobre modelos sinteticos, que se reproducen a continuacion tal cual.

Modelos de texto (10 transformaciones, 15 entradas, 3 repeticiones por combinacion):

| Transformacion | ExactMatch | Concept | LengthOnly | Random |
|---|---|---|---|---|
| case_flip | 1,00 | 1,00 | 1,00 | 0,04 |
| case_flip_letters | 1,00 | 1,00 | 1,00 | 0,27 |
| whitespace | 1,00 | 1,00 | 1,00 | 0,22 |
| stopword_drop | 1,00 | 1,00 | 1,00 | 0,33 |
| punct_strip | 1,00 | 1,00 | 1,00 | 0,13 |
| punct_add | 1,00 | 1,00 | 1,00 | 0,20 |
| synonym_swap | 0,78 | 0,93 | 1,00 | 0,31 |
| word_shuffle | 1,00 | 1,00 | 1,00 | 0,27 |
| char_typo_5pct | 0,87 | 0,82 | 1,00 | 0,47 |
| length_double | 1,00 | 1,00 | 1,00 | 0,20 |

Similitud de firma centrada:

| | ExactMatch | Concept | LengthOnly | Random |
|---|---|---|---|---|
| ExactMatch | 1,00 | 0,96 | 0,92 | -0,98 |
| Concept | 0,96 | 1,00 | 0,96 | -0,99 |
| LengthOnly | 0,92 | 0,96 | 1,00 | -0,98 |
| Random | -0,98 | -0,99 | -0,98 | 1,00 |

Modelo numerico f(x) = suma de x al cuadrado:

| Transformacion | Invariance | Δdecision | En el grupo |
|---|---|---|---|
| permute | 1,00 | 0,00 | Si |
| sign_flip | 1,00 | 0,00 | Si |
| zero_pad | 1,00 | 0,00 | Si |
| noise_0.1 | 1,00 | 0,48 | Si |
| shift_+0.5 | 0,30 | 0,90 | No |
| scale_1.5 | 0,00 | 1,00 | No |

No se dispone de medidas de latencia ni de throughput de la herramienta publicadas en la informacion proporcionada.

## Requisitos de hardware

- No requiere GPU para funcionar: la dependencia declarada es numpy, con matplotlib para los graficos.
- VRAM estimada para la propia herramienta: 0 GB. Se ejecuta en CPU.
- Almacenamiento: un unico fichero de aproximadamente 500 lineas, mas el entorno de numpy y matplotlib.
- GPU recomendadas para la herramienta: ninguna. Las necesidades de GPU vienen del modelo que se este sondeando, no de la utilidad.
- Si el modelo analizado es un LLM grande, el coste de VRAM es el de ese LLM, no el de holo-invariance; en ese caso se recomienda envolverlo con wrap_llm y comparar embeddings o distribuciones de tokens en lugar de texto bruto.
- Cabe en cualquier equipo capaz de ejecutar Python y NumPy, incluidos portatiles y contenedores ligeros.
- Opciones de despliegue: ejecucion directa del script (python holo_invariance.py), importacion como modulo dentro de un pipeline de evaluacion, o integracion en un job de integracion continua. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no sirve pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste dominante es el numero de entradas, transformaciones y repeticiones configurados, ademas del coste de inferencia del modelo sondeado.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de especificaciones, licencias ni resultados de otras herramientas comparables de medicion de invariancia, ni de frameworks de robustez con los que contrastar cifras. Por tanto, la comparativa cuantitativa no esta disponible. La tabla siguiente resume lo unico verificable, dejando las alternativas como no disponibles.

| Aspecto | holo-invariance | Alternativas de evaluacion de robustez |
|---|---|---|
| Enfoque | Grupo de invariancia por transformacion, con tres metricas separadas | No disponible en la informacion proporcionada |
| Parametros | No aplicable | No disponible |
| Contexto | No aplicable | No disponible |
| Resultados publicados | Solo la demo con cinco modelos sinteticos | No disponible |
| Licencia | Apache 2.0 | No disponible |
| Disponibilidad | Repositorio zeechimp/holo-invariance en HuggingFace, 0 descargas y 1 like | No disponible |
| Dependencias | numpy y matplotlib | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no hace tool calling y no debe evaluarse con benchmarks de LLM.
- La model card no documenta sesgos del modelo porque no hay modelo entrenado; el riesgo de sesgo recae en el criterio con el que el usuario elige las transformaciones.
- Riesgo de alucinacion no aplicable a la herramienta. El riesgo equivalente es interpretativo: una firma de invariancia calculada con pocas entradas o pocas repeticiones puede ser ruidosa.
- El propio autor advierte de que la comparacion de texto bruto en LLM es demasiado estricta; sin un extractor de caracteristicas adecuado, los resultados pueden infravalorar la invariancia real.
- El resultado depende del umbral de similitud; las cifras de pertenencia al grupo cambian si se modifica sim_threshold, de modo que dos informes solo son comparables si comparten umbral.
- El conjunto de transformaciones es fijo y limitado (diez de texto, seis numericas). Un modelo puede ser invariante a todas ellas y seguir siendo fragil frente a transformaciones no incluidas.
- El alcance linguistico declarado es solo ingles, tanto en las transformaciones de texto como en la documentacion.
- Los enlaces a los articulos sobre desajuste entre modo e interfaz que menciona la model card no se incluyen en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con conservacion del aviso de licencia. No se declaran restricciones adicionales.
- El repositorio registra 0 descargas y 1 like, por lo que no existe una comunidad amplia que haya validado el metodo de forma independiente.
- Fecha de creacion registrada como 2026-10-08, posterior a la fecha habitual de consulta; conviene verificar el estado del repositorio antes de citarlo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/zeechimp/holo-invariance
- Perfil del autor en HuggingFace: https://huggingface.co/zeechimp
- Otro repositorio del mismo autor: https://huggingface.co/zeechimp/zee
- Repositorio adicional del autor: zeechimp/hv-multimodal-audio-text-v1 (referenciado en los resultados de busqueda, sin URL completa disponible)
- Papers sobre desajuste entre modo e interfaz: no disponibles en la informacion proporcionada
- Demo, repositorio de codigo o espacio de HuggingFace asociado: no disponible en la informacion proporcionada

Nota: los resultados de busqueda web incluidos contenian tres enlaces sobre modelos GLM de Z.ai (Wikipedia, Business Insider y el blog de AWS) que no guardan relacion con esta herramienta y por tanto no se listan como referencias.
