# TheFusionCube/Sage-A1.5-Concise-GGUF

## Resumen

Sage-A1.5-Concise es un modelo de lenguaje de tipo mixture-of-experts (MoE) con 35.505.251.456 parámetros totales, de los cuales aproximadamente 3.000 millones están activos por token. Lo desarrolla TheFusionCube como una variante afinada mediante aprendizaje por refuerzo de Sage-A1.5 (InternScience), con el objetivo explícito de acortar la cadena de razonamiento: según la model card, consume entre un 11 % y un 26 % menos de tokens que el modelo base en cinco benchmarks sin pérdida significativa de calidad. Esta ficha describe la versión cuantizada en GGUF para llama.cpp.

La relevancia práctica del modelo reside en su relación entre capacidad y coste de inferencia: al activar solo unos 3.000 millones de parámetros por token, resulta viable en CPU. El autor reporta unos 18 tokens por segundo con Q4_K_M y 32 hilos en un servidor de 128 núcleos sin GPU. El repositorio incluye además un proyector de visión en F16, lo que habilita entrada de imágenes a través de llama-server.

Esta variante GGUF se publica bajo licencia Apache 2.0, con ficheros que van de 21,7 GB (Q4_K_M) a 37,8 GB (Q8_0), y está pensada para despliegues locales con llama.cpp y API compatible con OpenAI. No se han publicado resultados de benchmarks sobre los pesos cuantizados; las cifras de la model card principal corresponden al modelo BF16 ejecutado en vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), arquitectura `qwen35moe` según llama.cpp |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones por token |
| Longitud de contexto | Hasta 65.536 tokens en el ejemplo de llama-server (`-c 65536`); el modelo base recomienda contexto amplio |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0; proyector de visión en F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde BF16 con llama.cpp en el commit `7d7f028`, sin importance matrix) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) de 35.500 millones de parámetros totales y aproximadamente 3.000 millones activos por token. La arquitectura declarada en llama.cpp es `qwen35moe`, por lo que se requiere una build de llama.cpp que la soporte. El modelo parte de Sage-A1.5 (InternScience) y se ha sometido a aprendizaje por refuerzo para reducir la longitud de la cadena de razonamiento; según la model card, esa optimización recorta el consumo de tokens entre un 11 % y un 26 % en cinco benchmarks sin degradación significativa.

Los ficheros GGUF se generaron con `convert_hf_to_gguf.py` y `llama-quantize` a partir de los pesos BF16, sin matriz de importancia. El proyector de visión incluido es el del modelo base: el codificador visual no fue reentrenado, de modo que sus capacidades de imagen coinciden con las de Sage-A1.5. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni el algoritmo concreto de RL empleado.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso con cadena de pensamiento explícita, devuelta en el campo `reasoning_content` de la API.
- Razonamiento matemático de competición: el autor reporta resolución correcta de problemas de geometría analítica, cinemática y física cuántica en la prueba comparativa.
- Razonamiento químico: análisis de fórmulas moleculares, anillos y bioisósteros, con resultados mixtos en la prueba publicada.
- Generación de código: en la prueba del autor produjo una implementación de árbol palindrómico en Python que superó 3.000 comprobaciones por fuerza bruta.
- Cumplimiento de instrucciones de formato estrictas (reglas múltiples de estructura en una misma respuesta).
- Visión: transcripción de tablas desde imágenes mediante el fichero `mmproj` en F16.
- Compatibilidad con API OpenAI a través de llama-server (campos `content` y `reasoning_content`).
- No se documenta en la información disponible soporte de tool calling, function calling ni uso como agente con herramientas externas.

## Casos de uso

- Razonamiento matemático asistido en local: el modelo resuelve problemas de varios pasos con cadenas de razonamiento largas (más de 20.000 tokens en casos difíciles) y puede desplegarse en CPU, lo que permite usarlo en entornos sin GPU para verificación de cálculos y tutoría.
- Generación de código con verificación: dado que produce implementaciones completas y razonadas, encaja en flujos de generación de funciones o algoritmos que luego se validan con tests automáticos, como en la prueba del árbol palindrómico.
- Extracción de datos desde imágenes: con el proyector de visión se pueden transcribir tablas, formularios o capturas a texto estructurado, útil para digitalización de documentación.
- Asistencia en química y ciencias experimentales: análisis de estructuras moleculares, fórmulas y conceptos químicos, aunque con resultados desiguales en las pruebas publicadas, por lo que conviene usar el modelo como apoyo y no como fuente única.
- Despliegue en servidores sin GPU: con Q4_K_M y 32 hilos se obtienen unos 18 tokens por segundo en CPU, suficiente para servicios internos de preguntas y respuestas o procesamiento por lotes de documentos.
- Prototipado de asistentes conversacionales con API compatible con OpenAI: llama-server expone un endpoint que permite integrar el modelo en aplicaciones existentes sin cambiar el cliente, separando razonamiento y respuesta final.
- Evaluación de modelos de razonamiento eficiente: investigadores pueden comparar el comportamiento del modelo concise frente al base con idéntica cuantización para estudiar el efecto del RL en la longitud de la cadena de pensamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks sobre los pesos GGUF en la información disponible. La model card incluye una comparación cualitativa de una muestra por tarea entre la versión Concise Q4_K_M y el modelo base Sage-A1.5 cuantizado igual, ambas en llama-server sobre CPU con muestreo recomendado y tope de 28.000 tokens:

| Tarea | Concise Q4_K_M | Tokens | Base Q4_K_M | Tokens |
|---|---|---|---|---|
| Pares enteros en una cónica (matemáticas) | correcto | 4.684 | correcto | 15.011 |
| Problema de velocidad al caminar (matemáticas) | correcto | 5.515 | correcto | 7.488 |
| Longitud del lado de un hexágono (matemáticas) | alcanzó el tope | 28.000 | alcanzó el tope | 28.000 |
| Fórmula, anillos y esqueleto de loratadina (química) | alcanzó el tope | 28.000 | alcanzó el tope | 28.000 |
| Bioisóstero tetrazólico de ibuprofeno (química) | anillo incorrecto | 25.982 | alcanzó el tope | 28.000 |
| Árbol palindrómico en Python (código) | correcto, 3.000 comprobaciones superadas | 22.626 | alcanzó el tope | 28.000 |
| "Por qué el cielo es azul" con seis reglas de formato | todas las reglas cumplidas | 5.188 | todas las reglas cumplidas | 5.329 |
| Longitud de onda de De Broglie del electrón (física) | correcto | 19.233 | correcto | 22.132 |
| Transcripción de una tabla desde imagen (visión) | exacta | 319 | exacta | 340 |

El modelo concise acertó 6 de 9 tareas frente a 5 de 9 del base, y usó menos tokens en todas las tareas que alguno de los dos completó. El propio autor advierte que una muestra por tarea es insuficiente para medir precisión o longitud con rigor. Las cifras de la model card principal (reducción del 11-26 % de tokens en cinco benchmarks) se midieron sobre BF16 en vLLM, no sobre estas cuantizaciones.

## Requisitos de hardware

- VRAM o memoria RAM según cuantización: Q4_K_M 21,7 GB, Q5_K_M 25,3 GB, Q6_K 29,2 GB, Q8_0 37,8 GB; el proyector de visión añade 0,9 GB.
- Inferencia en CPU viable: el autor reporta unos 18 tokens/s con Q4_K_M, 32 hilos y sin GPU en un servidor de 128 núcleos.
- GPU: no se especifican modelos recomendados en la información disponible. Por tamaño, Q4_K_M puede caber en GPU de 24 GB solo con contexto reducido o descarga parcial de capas; Q8_0 requiere al menos 40 GB de memoria.
- En GPU de consumo: Q4_K_M no cabe completo en tarjetas de 16 GB; en tarjetas de 24 GB (por ejemplo, RTX 4090) cabría ajustando contexto y sin margen amplio, aunque este dato no está confirmado por el autor.
- Despliegue: llama.cpp (llama-server) con soporte de la arquitectura `qwen35moe`, build posterior al commit `7d7f028`; API compatible con OpenAI en el puerto 8080.
- Contexto: el ejemplo de despliegue usa `-c 65536`; el modelo puede generar más de 20.000 tokens de razonamiento en problemas difíciles, por lo que conviene reservar contexto amplio.
- Muestreo recomendado por el autor: `--temp 1.0 --top-p 0.95 --top-k 20 --presence-penalty 1.5`, con `--jinja`.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos por token | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Sage-A1.5-Concise (esta ficha) | 35,5 B | ~3 B | hasta 65.536 en el ejemplo | Apache 2.0 | GGUF |
| Sage-A1.5 (base) | 35 B | ~3 B | no disponible | no disponible | BF16, GGUF |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es contra Sage-A1.5 base, del que procede: misma arquitectura MoE y mismos parámetros, pero con RL para acortar el razonamiento. En la prueba del autor, la versión concise igualó o superó la precisión del base con menos tokens en todas las tareas completadas. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Las cuantizaciones GGUF no han sido evaluadas con benchmarks formales; las cifras de rendimiento de la model card principal corresponden al modelo BF16 en vLLM.
- La comparación Q4_K_M frente al base usa una sola muestra por tarea y nueve tareas, insuficiente para estimar precisión o longitud de razonamiento de forma fiable.
- En tareas de química el modelo falló o agotó el tope de tokens en dos de tres casos, lo que indica fragilidad en dominios especializados.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni de sesgos.
- Idiomas soportados no documentados; no hay garantía de calidad fuera del inglés.
- El codificador de visión no fue reentrenado y hereda las limitaciones del modelo base.
- Requiere una build de llama.cpp que soporte la arquitectura `qwen35moe`; versiones antiguas no cargarán el modelo.
- El contexto efectivo depende de la memoria disponible: con 21,7 GB de pesos en Q4_K_M, un contexto de 65.536 tokens exige RAM o VRAM adicional considerable.
- No se documenta soporte de tool calling ni de flujos de agente, lo que limita su uso en pipelines que dependan de llamadas a funciones.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Sage-A1.5 antes de un uso comercial, ya que la información disponible no detalla su licencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/TheFusionCube/Sage-A1.5-Concise-GGUF
- Modelo base de esta cuantización: https://huggingface.co/TheFusionCube/Sage-A1.5-Concise
- Modelo original: https://huggingface.co/InternScience/Sage-A1.5
