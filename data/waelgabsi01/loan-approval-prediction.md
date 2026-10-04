# waelGabsi01/loan-approval-prediction

# Ficha tecnica: loan-approval-prediction (waelGabsi01)

## Resumen

loan-approval-prediction es un modelo de clasificacion binaria tabular publicado en HuggingFace por el autor individual waelGabsi01. No es un modelo de lenguaje ni una red neuronal: se trata de una regresion logistica entrenada con scikit-learn que predice si una solicitud de prestamo se aprueba (`Approved` → 1) o se rechaza (`Rejected` → 0) a partir de ocho caracteristicas financieras y personales del solicitante, entre ellas la puntuacion CIBIL, los ingresos anuales, el importe del prestamo, la duracion, el numero de dependientes y el patrimonio total.

El modelo resuelve un problema de clasificacion supervisada sobre datos tabulares y su relevancia es exclusivamente didactica: la propia model card lo presenta como un ejercicio de aprendizaje dentro de un recorrido personal por el machine learning, siguiendo un tutorial practico. El repositorio contiene dos artefactos serializados con Pickle, `model.pkl` (el clasificador) y `scaler.pkl` (el `StandardScaler` ajustado), que deben usarse conjuntamente para reproducir el flujo de prediccion. El tamano del repositorio es de 0,0 GB, coherente con un modelo de pocos parametros.

Al no disponer de arquitectura de red, ventana de contexto ni pesos en safetensors o GGUF, varias de las filas habituales de una ficha de modelo generativo no aplican. El proyecto incluye codigo de entrenamiento y una aplicacion Streamlit en un repositorio de GitHub del autor, aunque la model card no proporciona la URL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (scikit-learn `LogisticRegression`) con preprocesado `StandardScaler` |
| Parametros totales | No disponible en la model card; con las 8 caracteristicas descritas corresponderian a 8 coeficientes mas el termino independiente |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular, no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica; el modelo se serializa con Pickle a precision completa (float64 de NumPy) |
| Idiomas soportados | No disponible (los valores categoricos de entrada estan en ingles: `Graduate`, `Not Graduate`, `Yes`, `No`) |
| Licencia | No disponible (ni en los metadatos de HuggingFace ni en la model card) |
| Formato de pesos | Pickle: `model.pkl` y `scaler.pkl` |
| Tarea | Clasificacion binaria tabular (`tabular-classification`) |
| Framework | scikit-learn |
| Variable objetivo | `Approved` = 1, `Rejected` = 0 |
| Caracteristicas de entrada | Numero de dependientes, educacion, situacion de autoempleo, ingresos anuales, importe del prestamo, duracion del prestamo, puntuacion CIBIL, patrimonio total |
| Codificacion categorica | `Graduate` → 1, `Not Graduate` → 0; `Yes` (autoempleado) → 1, `No` → 0 |
| Division de datos | 80 % entrenamiento / 20 % prueba |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-04 |
| Ultima actualizacion | 2026-10-04 |

## Arquitectura y entrenamiento

La arquitectura es una regresion logistica clasica, un modelo lineal generalizado que estima la probabilidad de la clase positiva mediante una funcion sigmoide aplicada a una combinacion lineal de las caracteristicas de entrada. Antes de la inferencia, las caracteristicas numericas se escalan con un `StandardScaler` ajustado durante el entrenamiento y persistido en `scaler.pkl`; este paso es obligatorio porque el modelo fue entrenado sobre datos estandarizados y no producira predicciones correctas si se le pasan valores en bruto.

El flujo de trabajo documentado en la model card comprende: carga del conjunto de datos de aprobacion de prestamos, eliminacion de la columna `loan_id`, limpieza de espacios sobrantes en valores categoricos, creacion de una caracteristica derivada `Total Assets` a partir de los activos residenciales, comerciales, de lujo y bancarios, eliminacion de las columnas de activos individuales, codificacion de variables categoricas, separacion de caracteristicas y objetivo, division 80/20, escalado con `StandardScaler`, entrenamiento de `LogisticRegression` y serializacion con Pickle. La model card no especifica el numero de filas del conjunto de datos, el origen del dataset, la presencia de valores atipicos o nulos, el tratamiento de los mismos, ni si se aplico validacion cruzada, busqueda de hiperparametros, regularizacion L1/L2 o ajuste de pesos de clase. Tampoco se documenta ningun proceso de ajuste por retroalimentacion humana (RLHF/DPO), algo que no aplica a este tipo de modelo.

## Capacidades

- Clasificacion binaria tabular: devuelve `Approved` o `Rejected` para una solicitud descrita por ocho caracteristicas.
- Preprocesado integrado: incluye la logica de escalado necesaria para reproducir el entrenamiento mediante `scaler.pkl`.
- Interpretabilidad intrinseca: al ser un modelo lineal, los coeficientes permiten leer la direccion y magnitud relativa del efecto de cada caracteristica sobre el logaritmo de las probabilidades.
- Ingenieria de caracteristicas documentada: agregacion de cuatro columnas de activos en una unica caracteristica `Total Assets`.
- Serializacion portable: los artefactos Pickle se pueden cargar en cualquier entorno con Python y las versiones compatibles de scikit-learn y NumPy.
- Integracion en aplicaciones: la model card menciona una aplicacion Streamlit que consume el modelo.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio, modo de pensamiento ni generacion de texto.
- No tiene capacidades multilingues: el modelo opera sobre valores numericos y categoricos codificados, no sobre lenguaje natural.

## Casos de uso

- Material didactico para pipelines de clasificacion tabular: sirve como ejemplo completo y reproducible de limpieza, ingenieria de caracteristicas, codificacion, escalado, entrenamiento y serializacion en scikit-learn.
- Baseline de comparacion: al ser un modelo lineal sencillo, se puede usar como referencia minima frente a alternativas como XGBoost, LightGBM o random forest en un mismo conjunto de datos tabulares.
- Demostracion de integracion modelo-aplicacion: el par `model.pkl` + `scaler.pkl` permite practicar el despliegue de un modelo en una API (por ejemplo FastAPI) o en una interfaz Streamlit.
- Analisis de sensibilidad e interpretabilidad: inspeccionando los coeficientes se pueden estudiar que variables (puntuacion CIBIL, ingresos, patrimonio) empujan la prediccion hacia la aprobacion o el rechazo.
- Ejercicios de evaluacion de sesgo y equidad: el modelo incluye caracteristicas sensibles o proxy como educacion o situacion de autoempleo, utiles para practicar auditorias de fairness a nivel academico.
- Pruebas de monitorizacion de deriva (data drift): al ser un pipeline con escalador persistido, permite practicar la deteccion de cambios en la distribucion de entrada y el reentrenamiento.
- Prototipos de preevaluacion de formularios en entornos controlados: unicamente con fines de demostracion y sin valor vinculante, la model card prohibe explicitamente su uso como base unica para decisiones reales de concesion de credito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe una division 80/20 de entrenamiento y prueba, pero no reporta ninguna metrica (exactitud, precision, recall, F1, AUC-ROC, matriz de confusion) ni en el conjunto de prueba ni en validacion. Tampoco se indica el tamano del conjunto de datos, por lo que no es posible contextualizar el rendimiento.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU por completo.
- Memoria principal: inferior a unos pocos megabytes, suficiente para cargar dos objetos Pickle de un modelo lineal con un maximo de 9 parametros y las estadisticas del `StandardScaler`.
- GPU: no recomendada ni necesaria; no existe soporte de aceleracion por GPU en el flujo descrito.
- Compatibilidad con GPU de consumo: irrelevante, ya que el modelo no requiere GPU.
- Despliegue: carga directa con `pickle` o `joblib` en un proceso Python; integrable en servicios HTTP (FastAPI, Flask), en Streamlit y en cualquier entorno que disponga de scikit-learn y NumPy. La conversion a ONNX mediante `skl2onnx` es tecnicamente viable, aunque no esta documentada por el autor.
- Latencia y throughput: no disponibles en la model card. Por la naturaleza del algoritmo, la inferencia es de coste despreciable en CPU, del orden de microsegundos a pocos milisegundos por peticion incluyendo el escalado, aunque no se aporta ninguna medicion.
- Almacenamiento: el repositorio ocupa 0,0 GB.

## Comparativa con modelos similares

Se comparan alternativas genericas de clasificacion tabular binaria. No se dispone de valores de rendimiento de este modelo, por lo que la comparacion es estructural.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| loan-approval-prediction (waelGabsi01) | Regresion logistica | No disponible (8 caracteristicas) | No aplica | No publicado | No disponible | HuggingFace, 0 descargas, 0 likes |
| Regresion logistica generica en scikit-learn | Modelo lineal | Configurable | No aplica | Depende del conjunto de datos | BSD-3-Clause | Libreria scikit-learn |
| XGBoost | Gradient boosting | Configurable | No aplica | Depende del conjunto de datos | Apache-2.0 | Libreria XGBoost |
| LightGBM | Gradient boosting | Configurable | No aplica | Depende del conjunto de datos | MIT | Libreria LightGBM |
| Random forest (scikit-learn) | Ensamble de arboles | Configurable | No aplica | Depende del conjunto de datos | BSD-3-Clause | Libreria scikit-learn |

## Limitaciones y advertencias

- La model card advierte explicitamente de que el modelo no debe utilizarse como base unica para decisiones reales de concesion de prestamos o decisiones financieras.
- No hay analisis de sesgo ni de equidad; caracteristicas como la educacion o la situacion de autoempleo pueden actuar como proxies de grupos socioeconomicos y generar discriminacion indirecta.
- La puntuacion CIBIL es un indicador de solvencia propio del mercado crediticio indio, lo que limita la validez del modelo fuera de ese contexto geografico y regulatorio.
- Riesgo de alucinacion: no aplica, ya que no es un modelo generativo de lenguaje. El riesgo equivalente es la extrapolacion indebida fuera de la distribucion de entrenamiento.
- No se documenta el conjunto de datos de origen, su tamano, su periodo temporal, el tratamiento de valores nulos o atipicos, ni las metricas obtenidas en el conjunto de prueba.
- No se especifica licencia, por lo que el uso comercial se encuentra en una situacion juridica indeterminada y no deberia asumirse permisivo.
- La ausencia de versionado de dependencias es un riesgo de reproducibilidad: el modelo Pickle puede no cargarse correctamente con versiones de scikit-learn distintas a las usadas en el entrenamiento.
- El uso del modelo exige respetar exactamente el orden de las ocho caracteristicas y aplicar el escalado con `scaler.pkl`; cualquier desviacion produce predicciones invalidas sin aviso de error.
- La documentacion no incluye validacion temporal, pruebas de robustez, monitorizacion en produccion ni analisis de calibracion de probabilidades.
- El proyecto esta orientado a aprendizaje y experimentacion; su madurez, soporte y mantenimiento no estan garantizados.

## Enlaces

- HuggingFace: https://huggingface.co/waelGabsi01/loan-approval-prediction
- Repositorio de GitHub con el codigo de entrenamiento y la aplicacion Streamlit: mencionado en la model card, URL no disponible
- Paper o publicacion tecnica: no disponible
- Demo desplegada: no disponible
- Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo (corresponden a Humble Bundle), por lo que no se han encontrado enlaces adicionales relevantes.
