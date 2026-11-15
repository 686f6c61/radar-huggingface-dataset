# WideChaos/char-router-abstention-study

## Resumen

`WideChaos/char-router-abstention-study` no es un modelo de lenguaje: es un clasificador lineal de texto entrenado desde cero con NumPy que predice una de tres rutas (`weather`, `calendar`, `notes`) a partir de peticiones cortas en ingles y chino, con la particularidad de que incorpora un mecanismo de abstención mediante umbral de softmax. Lo publica el usuario WideChaos como estudio de resultado negativo: el objetivo declarado es inspeccionar el limite entre "preferencia entre etiquetas disponibles" y "pertenencia real a alguna de ellas", y el hallazgo central es que el umbral seleccionado en validacion (0,4) fallo al rechazar las seis peticiones fuera de dominio del conjunto de test.

El modelo cuenta n-gramas de caracteres, aprende tres conjuntos de pesos a partir de 96 peticiones sinteticas construidas por el autor y serializa los pesos en JSON. No usa modelos preentrenados ni APIs externas, no ejecuta acciones reales (ni clima, ni calendario, ni notas) y no esta integrado en Transformers ni en ningun Inference Provider. Su valor es educativo y reproducible: el paquete incluye los 204 registros sinteticos, la traza de 300 epocas, la tabla de umbrales y todas las salidas de validacion y test.

Es relevante ahora como ejemplo didactico de por que la precision en validacion de un umbral de abstención no se transfiere automaticamente a un conjunto distinto de peticiones, y de por que una probabilidad softmax alta no equivale a confianza calibrada. Para desarrolladores que disenan routers o filtros de seguridad en produccion, ilustra un fallo concreto y medido sobre un caso controlado, sin pretension de generalizacion a mundo abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador lineal softmax sobre caracteristicas de n-gramas de caracteres (implementacion NumPy) |
| Parametros totales | No disponible (pesos serializados en JSON; el autor no publica el recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como ventana de atencion; la entrada esta limitada a 4096 caracteres en la CLI |
| Tipos de cuantizacion | No disponible (pesos en coma flotante JSON; no se documentan variantes cuantizadas) |
| Idiomas soportados | Ingles y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (pesos serializados, sin pickle ni codigo remoto) |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal con activacion softmax sobre un vector de caracteristicas construido contando secuencias cortas de caracteres (n-gramas de caracteres). Se entrena desde cero, sin inicializacion preentrenada, con solo NumPy como dependencia de inferencia. La salida son tres probabilidades, una por ruta (`weather`, `calendar`, `notes`), y la clase predicha es la de mayor probabilidad; si esa probabilidad maxima queda por debajo del umbral de abstención, la ruta devuelta es `null`.

Los datos son 204 registros sinteticos construidos integramente por el autor: ocho familias de plantillas bilingues por clase conocida, con cuatro variantes de slot por idioma. Las familias 0-3 se usan para entrenamiento (96 registros), las familias 4-5 para validacion (48 conocidos + 6 fuera de dominio) y las familias 6-7 para test (48 conocidos + 6 fuera de dominio). Los hermanos ingles/chino y las variantes de slot se mantienen en el mismo split para evitar filtracion. Se anaden seis familias fuera de dominio separadas, repartidas entre validacion y test, ninguna usada en entrenamiento. El entrenamiento recorre 300 epocas con una unica configuracion congelada; el umbral se elige sobre validacion y no se reajusta tras leer los resultados de test.

## Capacidades

- Clasificacion de texto corto en una de tres rutas: `weather`, `calendar` o `notes`.
- Abstención mediante umbral de probabilidad softmax: si la confianza maxima no supera el umbral, devuelve `route: null`.
- Salida de las tres probabilidades por clase, el umbral aplicado, la decision de aceptacion y la razon.
- Soporte bilingue limitado a ingles y chino, sobre plantillas sinteticas del autor.
- Interfaz de linea de comandos (`router.py`) que acepta un modelo JSON local y un texto de hasta 4096 caracteres.
- Reproducibilidad completa: scripts de entrenamiento (`train.py`), verificacion (`verify_results.py`) y tests (`test_router`).
- No soporta tool calling real, ni ejecucion de acciones, ni razonamiento multi-paso, ni agentes, ni vision, ni audio.

## Casos de uso

- Estudio de calibracion y abstención: usar el paquete para reproducir el fallo del umbral 0,4 sobre las seis peticiones fuera de dominio del test y analizar por que la precision de validacion (44/47) no se transfiere al test (43/52).
- Docencia sobre routers y filtros de seguridad: el modelo sirve como caso concreto y medido de la diferencia entre "preferencia entre etiquetas" y "pertenencia a una clase", con datos y codigo disponibles para que el alumnado repita el experimento.
- Prueba de concepto de clasificacion en CPU: al requerir solo NumPy, puede ejecutarse en cualquier maquina sin GPU para validar un pipeline minimo de entrenamiento, serializacion y evaluacion.
- Verificacion de reproducibilidad: `verify_results.py` permite comprobar que una reejecucion del entrenamiento produce los mismos recuentos de decisiones dentro de tolerancias numericas, util en auditorias de experimentos.
- Referencia negativa en revisiones de diseno: sirve para argumentar, con numeros, por que no se debe fijar un umbral de abstención solo con validacion cuando el conjunto de test puede contener peticiones fuera de dominio no representadas.
- Ejemplo de empaquetado de pesos sin riesgo de ejecucion: el JSON de pesos no contiene pickle ni codigo remoto, lo que lo hace apto como ejemplo de serializacion segura en entornos restringidos.

## Benchmarks y rendimiento

El autor publica los siguientes resultados sobre sus conjuntos sinteticos:

| Metrica | Validacion | Test retenido |
|---|---|---|
| Precision top-1 en rutas conocidas | 48/48 | 44/48 |
| Aceptadas correctas / total aceptadas | 44/47 | 43/52 |
| Correctas aceptadas / casos conocidos | 44/48 | 43/48 |
| Fuera de dominio aceptadas / total fuera de dominio | 3/6 | 6/6 |
| Aceptadas / total de casos | 47/54 | 52/54 |

La precision de las aceptadas en test fue 43/52, aproximadamente 0,827, frente al objetivo empirico de validacion de al menos 0,9. La linea base de mayoria de clase conocida, seleccionada con recuentos de entrenamiento y desempate por orden de clase, predice `weather` y acierta 16/48 casos conocidos de test; esta linea base no aborda el rechazo fuera de dominio. La precision del test en rutas conocidas fue 20/24 en ingles y 24/24 en chino, con solo tres ejemplos fuera de dominio por idioma, todos aceptados. El ejemplo `Suggest a soup recipe.` se acepto como `notes` con probabilidad softmax maxima de aproximadamente 0,486. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo solo requiere NumPy; no necesita GPU ni VRAM dedicada.
- Memoria: los pesos se cargan desde un JSON de tamano reducido; no se publica una cifra exacta de memoria en reposo.
- GPU recomendadas: no aplica; el autor no documenta despliegue en GPU.
- Compatibilidad con GPU de consumo: no relevante para este modelo por su naturaleza de clasificador NumPy.
- Opciones de despliegue: ejecucion local mediante `router.py` (CLI) y scripts de entrenamiento/verificacion; no hay integracion verificada con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no publica mediciones.
- Entorno probado: CPython 3.12.14 y NumPy 2.5.4.

## Comparativa con modelos similares

No disponible. El autor no proporciona comparaciones con otros modelos, y la informacion disponible no identifica alternativas de la misma categoria (clasificadores lineales de n-gramas de caracteres con abstención) con datos verificables. La unica referencia interna es la linea base de mayoria de clase descrita en la model card (16/48 en casos conocidos de test), que no constituye un modelo comparable externo.

## Limitaciones y advertencias

- El umbral de abstención fallo en el test: las seis peticiones fuera de dominio se aceptaron, pese a que en validacion se aceptaron solo 3 de 6.
- La probabilidad softmax no es confianza calibrada; el autor lo advierte explicitamente y el caso de la receta de sopa (0,486 aceptada como `notes`) lo ilustra.
- Los datos son 204 registros sinteticos construidos por el autor, con plantillas visibles para el; los resultados no estiman seguridad en mundo abierto.
- Solo tres ejemplos fuera de dominio por idioma en test, lo que impide cualquier conclusion sobre superioridad entre ingles y chino o sobre comprension bilingue general.
- El modelo no es un modelo de lenguaje, ni un router de produccion, ni un filtro de seguridad; el autor lo califica de estudio educativo de resultado negativo.
- No ejecuta acciones reales de clima, calendario o notas; la ruta predicha es solo una etiqueta.
- No hay integracion verificada con Transformers ni con Inference Providers, ni aplicacion alojada.
- La licencia Apache 2.0 permite uso comercial, pero el propio autor desaconseja emplearlo como componente de produccion por sus garantias inexistentes fuera del conjunto sintetico.
- Los ultimos digitos en coma flotante y los hashes pueden variar segun NumPy, BLAS y plataforma; la comparacion debe hacerse por recuentos y tolerancias numericas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WideChaos/char-router-abstention-study
- Resultado de busqueda web proporcionado (no relacionado con el modelo): https://www.cnet.com/tech/mobile/apple-airpods-pro-2-usb-c-review/
