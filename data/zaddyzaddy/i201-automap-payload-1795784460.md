# zaddyzaddy/i201-automap-payload-1795784460

## Resumen

El modelo `i201-automap-payload-1795784460`, publicado por el usuario `zaddyzaddy` en Hugging Face, es un artefacto de tipo BERT orientado a clasificación de texto que se presenta, segun su propia model card, como un "trust-remote-code tripwire (do not use)". Es decir, el autor lo describe explicitamente como un senuelo o trampa destinada a detectar el uso indiscriminado de `trust_remote_code=True` en pipelines de carga de modelos. No se trata, por tanto, de un modelo pensado para produccion ni para evaluacion de capacidades.

El repositorio contiene pesos en formato safetensors con un total de 800 parametros, una cifra extraordinariamente baja para un transformer BERT convencional, lo que refuerza la hipotesis de que se trata de un artefacto minimo o simulado. Incorpora la etiqueta `custom_code`, lo que implica que su carga requiere ejecutar codigo Python proporcionado por el autor, exactamente el vector de riesgo que el modelo pretende ilustrar.

Su relevancia es fundamentalmente de seguridad: sirve como caso de estudio para equipos que disenan sistemas de ingesta automatica de modelos desde hubs publicos y necesitan recordar que la etiqueta `custom_code` y la carga con `trust_remote_code=True` habilitan ejecucion de codigo arbitrario en el entorno del usuario. No dispone de descargas ni de likes en el momento de la consulta, y no se ha publicado informacion sobre arquitectura interna, datos de entrenamiento, licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (segun tag de Hugging Face; detalle interno no disponible) |
| Parametros totales | 800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Requiere codigo remoto | si (tag `custom_code`) |
| Descargas | 0 |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

La unica informacion disponible indica que el modelo se etiqueta como `bert` dentro de la libreria `transformers` y que se publica para la tarea de clasificacion de texto. No se ha publicado informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion, funcion de activacion ni sobre el tokenizador asociado.

El recuento real de parametros en safetensors (800) es incompatible con un BERT base o incluso con un BERT tiny funcional, lo que sugiere que el checkpoint no contiene un modelo entrenado en el sentido habitual, sino un artefacto minimo. No hay datos sobre corpus de entrenamiento, numero de tokens, composicion del dataset, ni sobre fases de ajuste como RLHF, DPO o fine-tuning supervisado. La model card no describe ninguna innovacion tecnica; su unico contenido relevante es la advertencia de no uso y la referencia a `trust-remote-code`.

## Capacidades

- Clasificacion de texto: unica capacidad declarada mediante el `pipeline_tag` del repositorio; no hay evidencia de que funcione en la practica.
- Generacion de texto: no disponible.
- Razonamiento, matematicas y codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible.
- Modo "thinking": no disponible.

La capacidad real y verificable del artefacto es la de forzar la ejecucion de codigo remoto si se carga con `trust_remote_code=True`, lo que constituye un mecanismo de senuelo (tripwire) mas que una funcionalidad de modelo.

## Casos de uso

- Auditoria de pipelines de ingesta de modelos: usar este repositorio como caso de prueba controlado para verificar que un sistema de descarga y validacion de modelos de Hugging Face detecta la etiqueta `custom_code` y bloquea o aisla la carga antes de ejecutar codigo del autor.
- Formacion en seguridad de la cadena de suministro de IA: emplearlo en talleres internos para demostrar por que `trust_remote_code=True` debe tratarse como una decision consciente y revisada, no como un valor por defecto.
- Pruebas de sandboxing: validar que un entorno de ejecucion aislado (contenedor sin red, sin acceso al sistema de ficheros del host) contiene correctamente la ejecucion de codigo arbitrario durante la carga de un checkpoint.
- Verificacion de escaneres de modelos: comprobar que herramientas de analisis estatico marcan correctamente repositorios con `custom_code` y pesos de tamano anomalo como sospechosos.
- Pruebas de politicas de allowlist/denylist: confirmar que la politica de un registro interno de modelos rechaza artefactos sin licencia, sin idiomas declarados y con cero descargas.
- Simulacion de incidentes: reproducir en un entorno de laboratorio el escenario de un modelo malicioso o comprometido para entrenar al equipo de respuesta ante incidentes.

En ningun caso debe desplegarse este artefacto en un sistema de atencion al cliente, generacion de codigo, analisis documental ni en cualquier flujo de produccion: no hay evidencia de que realice clasificacion de texto util y su proposito declarado es precisamente el contrario al uso productivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable por el recuento de 800 parametros en safetensors; no obstante, la carga con `custom_code` puede ejecutar codigo arbitrario con requisitos impredecibles.
- GPU recomendadas: ninguna; el artefacto no esta pensado para inferencia real.
- Cabe en GPU de consumo: si, por tamano de pesos; irrelevante a efectos practicos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (desaconsejado); no se ha verificado compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria; el artefacto no es equiparable a clasificadores BERT funcionales como los publicados por equipos de investigacion con licencia y model card completa.

## Limitaciones y advertencias

- La model card indica explicitamente "do not use": el autor desaconseja su uso.
- Riesgo de seguridad alto: la etiqueta `custom_code` implica ejecucion de codigo Python del autor al cargar el modelo con `trust_remote_code=True`, con el consiguiente riesgo de ejecucion arbitraria en el entorno del usuario.
- Ausencia de licencia declarada: no hay base legal explicita para uso comercial ni para redistribucion.
- Ausencia de idiomas declarados y de informacion sobre sesgos: imposible evaluar comportamiento linguistico o demografico.
- Recuento de parametros (800) incompatible con un modelo funcional: alta probabilidad de que las predicciones no sean significativas.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Fecha de creacion futura respecto a la mayoria de referencias habituales, lo que conviene verificar antes de cualquier analisis.
- No debe incorporarse a pipelines automatizados de produccion ni a sistemas de atencion al cliente, moderacion o clasificacion documental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zaddyzaddy/i201-automap-payload-1795784460
