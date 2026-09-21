# srivathsanb14/hw2-classical-automl-3d-print

## Resumen

Se trata de un clasificador tabular binario construido con AutoGluon Tabular 1.6.1 por el usuario srivathsanb14, publicado como artefacto docente para la asignatura 24-679 (tarea HW2). El modelo predice si una pieza laminada con Bambu Studio sera una impresion larga, definida como un tiempo de impresion igual o superior a 6 horas, a partir exclusivamente de ajustes del laminador. No es un modelo de lenguaje ni una red neuronal generativa: es un ensemble de modelos tabulares serializado, con 5 variables de entrada y una salida de clasificacion.

El interes tecnico del artefacto es metodologico. El autor documenta de forma explicita la regla anti-fuga aplicada (excluir `print_time_min` y `print_time_hms`, ya que la variable objetivo es un umbral sobre ellas) y publica las metricas junto con una linea base mayoritaria, algo poco habitual en repositorios docentes. Los splits son deliberadamente pequenos: 321 filas de entrenamiento (21 piezas reales mas hijos sinteticos de aumento de datos), 4 de validacion y 5 de prueba, todas estas ultimas originales sin aumentar.

La relevancia es limitada y acotada a su proposito declarado: sirve como ejemplo reproducible de un flujo AutoML completo en Google Colab con un presupuesto de 300 segundos, y como caso de estudio sobre los peligros de evaluar con conjuntos de prueba minusculos. El propio autor advierte que no debe usarse para programar trabajos de impresion reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de modelos tabulares generado por AutoGluon Tabular 1.6.1; mejor modelo publicado: `WeightedEnsemble_L2`. Sin bagging (0 folds) ni stacking adicional (0 niveles) |
| Parametros totales | No disponible (no aplica: modelo tabular, no neuronal) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada fija de 5 caracteristicas tabulares) |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas; el artefacto es un predictor serializado) |
| Idiomas soportados | `en` (model card, nombres de columnas y valores categoricos en ingles: `functional`, `novelty`) |
| Licencia | MIT para el repositorio del modelo; el dataset de origen es CC BY 4.0 y requiere atribucion a yennik16 |
| Formato de pesos | Predictor de AutoGluon serializado (`predictor.pkl` y artefactos auxiliares) empaquetado en `autogluon_predictor_dir.zip`; no hay safetensors ni GGUF |
| Tarea | Clasificacion binaria tabular (`pipeline_tag`: `tabular-classification`) |
| Variable objetivo | `long_print`: 0 = corta, 1 = larga (clase positiva = 1, umbral >= 6 horas) |
| Variables de entrada | `filament_g` (numerica, gramos), `infill_pct` (numerica, 0-100), `layer_height_mm` (numerica, mm), `nozzle_mm` (categorica, hardware), `use_category` (categorica: functional / novelty) |
| Variables excluidas | `print_time_min`, `print_time_hms` (fuga directa sobre el objetivo), identificadores y metadatos de aumento |
| Framework | AutoGluon Tabular 1.6.1, preset `medium_quality` |
| Presupuesto de entrenamiento | 300 s de AutoML; 28,5 s de tiempo real |
| Metrica de seleccion | `balanced_accuracy` sobre la validacion publicada |
| Semilla | 24679 |
| Filas de entrenamiento | 321 (21 piezas reales + hijos sinteticos) |
| Filas de validacion | 4 (originales sin aumentar) |
| Filas de prueba | 5 (originales sin aumentar) |

## Arquitectura y entrenamiento

No se publica la composicion interna del ensemble. La model card indica unicamente que el mejor modelo resultante de la busqueda AutoML es un `WeightedEnsemble_L2`, obtenido con el preset `medium_quality` de AutoGluon Tabular 1.6.1, sin bagging (0 folds) y sin niveles de stacking adicionales (0 niveles). La seleccion del mejor candidato se hizo maximizando `balanced_accuracy` sobre el split de validacion de 4 filas, con semilla fija 24679 y un presupuesto total de 300 segundos, consumiendo 28,5 segundos de reloj en Google Colab con Python 3.13.15.

En cuanto a los datos, la fuente es el dataset `yennik16/3d-print-jobs-tabular`, creado por un companero de clase y publicado bajo CC BY 4.0. El conjunto de entrenamiento contiene 21 piezas reales mas piezas sinteticas derivadas mediante aumentacion, lo que explica el salto de 21 a 321 filas. La validacion y la prueba se reservan a originales sin aumentar, un criterio correcto para evitar que el aumento de datos infle las metricas. La regla de fuga aplicada consistio en eliminar las columnas de tiempo de impresion, dado que el objetivo es precisamente un umbral sobre ese tiempo. No se aplico RLHF, DPO ni ninguna tecnica de alineacion, ya que no procede en un modelo de clasificacion tabular.

## Capacidades

- Clasificacion binaria tabular: asigna una etiqueta `long_print` (0 o 1) a partir de cinco ajustes de laminado.
- Prediccion de categoria en funcion del material consumido, el porcentaje de relleno, la altura de capa, el diametro de boquilla y el tipo de uso de la pieza.
- Integracion con el ecosistema AutoGluon: carga mediante `TabularPredictor.load` y prediccion por lotes o fila a fila.
- Capacidad de reentrenamiento y ajuste con datos propios del usuario, ya que el pipeline de AutoGluon permite repetir la busqueda con otro dataset.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible; el artefacto solo maneja etiquetas categoricas en ingles.
- Modo "thinking", vision o audio: no disponible (no aplica).
- Generacion de texto, codigo o matematicas: no disponible (no aplica).

## Casos de uso

- Material didactico en un curso de AutoML: el repositorio sirve como plantilla ejecutable de un flujo completo (definicion de features, split, busqueda con presupuesto temporal y publicacion de metricas) para estudiantes que se enfrentan por primera vez a AutoGluon Tabular.
- Caso de estudio sobre fuga de datos: la decision documentada de excluir `print_time_min` y `print_time_hms` permite ilustrar en clase como identificar y evitar una fuga directa sobre la variable objetivo.
- Ejemplo reproducible para comparar presets: al fijar semilla, presupuesto y metrica, el artefacto permite reproducir el experimento en Colab y medir el efecto de cambiar el preset o el presupuesto de 300 s.
- Prototipo interno de estimacion de duracion para laminadores: con un conjunto de datos propio y etiquetas fiables, la misma receta de AutoGluon se podria reutilizar para anticipar si un trabajo superara un umbral de tiempo; el modelo publicado, sin embargo, no es apto para produccion dadas sus 5 filas de prueba.
- Aviso en colas de impresion 3D: en un taller con varias impresoras, un clasificador de este tipo podria marcar trabajos candidatos a bloquear la maquina durante horas y sugerir su reubicacion en una franja nocturna, siempre que se reentrene con datos reales del taller y se validen las probabilidades.
- Investigacion sobre aumentacion de datos tabulares: la separacion explicita entre filas sinteticas (solo en entrenamiento) y originales (validacion y prueba) lo convierte en un ejemplo util para estudiar como la aumentacion afecta a la estimacion del rendimiento.
- Linea base para trabajos posteriores de la asignatura: cualquier estudiante puede cargar el predictor y comparar su propio modelo contra el `WeightedEnsemble_L2` del HW2.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre las 5 piezas originales del conjunto de prueba:

| Metrica | Modelo (`WeightedEnsemble_L2`) | Linea base mayoritaria |
|---|---|---|
| Accuracy | 1,0000 (5/5) | 0,6000 |
| Balanced accuracy | 1,0000 | 0,5000 |
| Weighted F1 | 1,0000 | No disponible |
| Macro F1 | 1,0000 | No disponible |

Advertencia del propio autor: con solo 5 ejemplos de prueba, una unica prediccion erronea desplaza la accuracy 20 puntos porcentuales. No se han publicado resultados de benchmarks independientes ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el modelo es tabular y se ejecuta en CPU.
- GPU recomendadas: no requiere GPU. El autor entreno y evaluo el modelo en Google Colab, sin especificar acelerador.
- Compatibilidad con GPU de consumo: irrelevante; cualquier CPU convencional es suficiente.
- Coste de entrenamiento: 28,5 segundos de tiempo real con un presupuesto configurado de 300 segundos, en Python 3.13.15.
- Opciones de despliegue: AutoGluon Tabular mediante `TabularPredictor.load` sobre el contenido de `autogluon_predictor_dir.zip`. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de artefacto.
- Latencia y throughput: no disponible; no se publican mediciones de latencia de inferencia.
- Tamano del repositorio: 0,0 GB segun los metadatos de HuggingFace.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible otros modelos publicados comparables a este artefacto. La unica referencia cuantitativa publicada es la linea base mayoritaria del propio autor, incluida en la tabla siguiente:

| Modelo | Parametros | Contexto | Rendimiento en prueba | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `srivathsanb14/hw2-classical-automl-3d-print` | No aplica (tabular) | No aplica (5 features) | Accuracy 1,0000; balanced accuracy 1,0000 sobre 5 filas | MIT (repo) / CC BY 4.0 (dataset) | HuggingFace, 0 descargas, 0 likes |
| Linea base mayoritaria | No aplica | No aplica | Accuracy 0,6000; balanced accuracy 0,5000 | No disponible | Definida en la propia model card |
| Otras alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Prohibicion de uso operativo: el autor indica explicitamente que no se debe programar trabajos de impresion de pago con este modelo.
- Conjunto de prueba de 5 filas: cualquier metrica derivada de el tiene un intervalo de confianza enorme; una sola prediccion erronea cambia la accuracy en 20 puntos.
- Entrenamiento dominado por datos sinteticos: solo 21 piezas reales frente a 321 filas totales, lo que hace plausible un sobreajuste a los patrones introducidos por la aumentacion.
- Riesgo de fuga no verificado por terceros: la regla anti-fuga la aplico el propio autor y no ha sido auditada externamente.
- Alcance de dominio muy estrecho: el modelo solo es valido para piezas laminadas con Bambu Studio descritas por las cinco variables de entrada; fuera de ese supuesto su comportamiento es desconocido.
- Valores categoricos cerrados: `use_category` solo contempla `functional` y `novelty`; no hay soporte documentado para categorias nuevas.
- Sin calibracion publicada: no se ofrecen curvas de calibracion ni umbrales de decision alternativos, por lo que no se debe confiar en la probabilidad de salida sin validacion previa.
- Idiomas: documentacion y etiquetas unicamente en ingles; no hay soporte multilingue.
- Licencia: el repositorio es MIT, pero el dataset de origen es CC BY 4.0 y exige atribucion a yennik16 en cualquier redistribucion o trabajo derivado.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; se trata de un artefacto docente no revisado por pares.
- Uso comercial: la licencia MIT permitiria el uso comercial del artefacto, pero su rendimiento real no esta demostrado y la atribucion del dataset sigue siendo obligatoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/srivathsanb14/hw2-classical-automl-3d-print
- Dataset de origen (HW1, yennik16): https://huggingface.co/datasets/yennik16/3d-print-jobs-tabular
- Artefacto descargable: `autogluon_predictor_dir.zip` (referenciado en la model card del repositorio)
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; las paginas devueltas corresponden a la web municipal de Villeneuve-Saint-Georges y no guardan relacion con el artefacto.
