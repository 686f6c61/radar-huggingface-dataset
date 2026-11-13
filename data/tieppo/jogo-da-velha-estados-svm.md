# Tieppo/jogo-da-velha-estados-svm

## Resumen

El modelo `Tieppo/jogo-da-velha-estados-svm` es un clasificador SVM (support vector machine) de cinco clases entrenado con scikit-learn para clasificar estados de tableros de tres en tres del juego de la vieja (jogo da velha en portugues). Lo desarrolla el usuario Tieppo como parte de un proyecto academico en grupo y se distribuye como un artefacto serializado con joblib en Hugging Face. Las cinco clases son `tem_jogo`, `possibilidade_fim_jogo`, `empate`, `o_vence` y `x_vence`.

No se trata de un modelo de lenguaje ni de una red neuronal: es un clasificador tabular clasico que recibe una representacion de un tablero 3x3 (nueve celdas con `x`, `o` o `b`) y devuelve una de las cinco categorias. Su relevancia es exclusivamente educativa y de demostracion de un pipeline de machine learning supervisado con scikit-learn; no esta pensado para produccion ni para jugar partidas reales.

El conjunto de datos se genero mediante reglas deterministicas del propio juego, con 571 tableros para entrenamiento, 122 para seleccion de hiperparametros y 123 para evaluacion final. El autor declara explicitamente que los rotulos provienen de reglas deterministas y que estas siguen siendo la solucion correcta para un juego real, por lo que el modelo debe entenderse como un ejercicio de clasificacion, no como un sustituto del motor de reglas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SVM multiclase (scikit-learn) sobre representacion tabular del tablero 3x3 |
| Parametros totales | no disponible (modelo clasico; hiperparametros C=100 y gamma=0.01) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de 9 celdas) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto joblib) |
| Idiomas soportados | portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | joblib (`model.joblib`, serializado con pickle) |

## Arquitectura y entrenamiento

El modelo es un clasificador de vectores de soporte multiclase de scikit-learn, entrenado sobre una representacion tabular de tableros 3x3. Las entradas usan `x` y `o` para las piezas y `b` para celdas vacias, leidas fila a fila. No hay arquitectura transformer, MoE, SSM ni componentes neuronales; el modelo se limita a un clasificador clasico con kernel (los hiperparametros declarados, `C=100` y `gamma=0.01`, son propios de un SVM con kernel RBF).

El conjunto de datos se genero a partir de las reglas del juego y se dividio en 571 tableros de entrenamiento, 122 de seleccion de hiperparametros y 123 de evaluacion final. Los datos UCI de estados finales se usaron como referencia de estructura, no como rotulos del modelo. La seleccion de hiperparametros se hizo exclusivamente sobre la validacion mediante F1 macro (80,8 %); el autor senala que el notebook original seleccionaba el mejor algoritmo mirando el conjunto de test, mientras que este paquete corrige esa fuga de informacion. No se menciona uso de RLHF, DPO ni tecnicas de aumento de datos.

## Capacidades

- Clasificacion de tableros 3x3 en cinco categorias: `tem_jogo`, `possibilidade_fim_jogo`, `empate`, `o_vence` y `x_vence`.
- Entrada de texto simple con notacion `x`, `o` y `b`, leida fila a fila (por ejemplo, `xobbbobxx`).
- Validacion de formato de la entrada, pero no de la legalidad del estado del tablero.
- Ejecucion local mediante un script de inferencia (`inference.py`) y dependencias en `requirements.txt`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue limitada al portugues en la documentacion y la nomenclatura de clases.

## Casos de uso

- Docencia de machine learning: sirve como ejemplo completo de pipeline supervisado con scikit-learn (split de datos, seleccion de hiperparametros en validacion y evaluacion final en test) para explicar la diferencia entre validacion y test.
- Demostracion de clasificacion multiclase: permite ilustrar como un SVM con kernel RBF separa cinco clases a partir de una representacion tabular de nueve atributos.
- Practicas de evaluacion: util para discutir metricas como F1 macro en problemas con clases desbalanceadas, usando los resultados declarados (F1 macro de 65,2 % en test frente a una precision del 82,1 %).
- Ejercicios de analisis de fuga de informacion: el propio autor documenta el error del notebook original (seleccionar mirando el test), lo que lo convierte en un caso practico para ensenar buenas practicas de validacion.
- Prototipado de reglas de juego: puede usarse como comparacion frente a un motor de reglas deterministico para mostrar por que, en dominios con reglas exactas, el enfoque basado en reglas sigue siendo preferible.
- Integracion en notebooks y scripts educativos: al ser un artefacto joblib ligero (repo de 0,0 GB), se carga rapidamente en entornos de aula o de autoaprendizaje.

## Benchmarks y rendimiento

| Metrica | Valor declarado por el autor |
|---|---|
| F1 macro en validacion (seleccion de hiperparametros) | 80,8 % |
| Precision (accuracy) en test | 82,1 % |
| F1 macro en test | 65,2 % |

No se han publicado otros resultados de benchmarks en la informacion disponible. El model-index de la model card no incluye resultados adicionales.

## Requisitos de hardware

- VRAM estimada: no aplica; es un clasificador clasico de scikit-learn y se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier equipo convencional, incluidos portatiles de gama baja, dado el tamano del repositorio (0,0 GB).
- Opciones de despliegue: ejecucion directa con Python, scikit-learn y joblib mediante `inference.py`; no se contemplan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tieppo/jogo-da-velha-estados-svm | SVM (scikit-learn) | 5 | no aplica (entrada fija de 9 celdas) | no disponible | Hugging Face (joblib) |
| Motor de reglas deterministico del juego | Reglas | 5 estados equivalentes | no aplica | no aplica | Implementacion propia |
| Otros clasificadores tabulares (arboles, regresion logistica) | Clasicos | variable | no aplica | variable | scikit-learn |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Los rotulos provienen de reglas deterministicas del juego; el autor advierte que esas reglas siguen siendo la solucion correcta para un juego real, por lo que el modelo no debe usarse como motor de juego.
- Tableros relacionados por rotacion o reflexion pueden aparecer en splits distintos, de modo que la metrica no mide generalizacion a estados estructuralmente ineditos.
- El script de inferencia valida solo el formato de la entrada, no la legalidad del estado del tablero.
- El artefacto `model.joblib` usa pickle; debe cargarse unicamente desde fuentes de confianza por el riesgo de ejecucion de codigo arbitrario.
- No hay informacion sobre sesgos, riesgos de alucinacion (no aplica a un clasificador) ni sobre la licencia, por lo que se desconoce si el uso comercial esta permitido.
- El rendimiento declarado (F1 macro de 65,2 % en test) indica un desequilibrio notable entre clases; conviene revisar la matriz de confusion antes de cualquier uso serio.
- Modelo de proposito educativo, sin mantenimiento ni soporte declarados.

## Enlaces

- [Hugging Face: Tieppo/jogo-da-velha-estados-svm](https://huggingface.co/Tieppo/jogo-da-velha-estados-svm)
- [Proyecto academico en GitHub: Mateus-Tieppo/tic-tac-toe-ml](https://github.com/Mateus-Tieppo/tic-tac-toe-ml) (commit `bf5275c6b5a372fa777e1ecd038d68d3e7a73580`)
- Dataset UCI de referencia estructural: no disponible como enlace en la informacion proporcionada.
