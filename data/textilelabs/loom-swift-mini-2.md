# textilelabs/Loom-Swift-Mini-2

## Resumen

Loom Swift Mini 2 es un modelo de lenguaje minúsculo de 2.005.376 parámetros entrenado desde cero por Textile Labs, diseñado para tareas muy concretas en dispositivos con recursos limitados: identificar su identidad, decidir cuándo hace falta una herramienta, escribir llamadas a calculadora, hacer aritmética de fechas, etiquetar texto y extraer campos de textos cortos. No es un modelo conversacional generalista ni un razonador; es un experimento de "humble AI" publicado para ejecutarse en móviles y aplicaciones de escritorio ligeras.

Es la segunda generación de Loom Swift Mini. La principal novedad es que se ha reconstruido sobre el layout de Gemma-3 (con ventana deslizante local y una capa global cada seis capas), lo que le permite funcionar directamente en PocketPal, LM Studio, Jan, llama.cpp y Ollama a partir del GGUF, con plantilla de chat y token de fin de turno integrados. El contexto pasa de 512 a 2.048 tokens y el tokenizador BPE de 4.096 piezas se ha rehecho con cada dígito como token independiente.

Su relevancia no está en el rendimiento bruto —compite con modelos 10 veces mayores de la propia familia— sino en demostrar cuánta funcionalidad de agente (tool calling, etiquetado, extracción) cabe en 2 millones de parámetros entrenados en solo 10 minutos en dos T4 de Kaggle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Gemma-3 (ventana deslizante local + capa global cada 6 capas), 10 capas × 128 dimensiones |
| Parametros totales | 2.005.376 |
| Parametros activos | 2.005.376 (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (GGUF); precisión original no disponible |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo emplea el layout de Gemma-3: la mayoría de capas usan atención local con ventana deslizante y una capa global aparece cada seis capas, lo que reduce el coste de atención manteniendo acceso a contexto largo. Consta de 10 capas con 128 dimensiones. El tokenizador es un BPE de 4.096 tokens reconstruido para que cada dígito sea un token independiente, detalle relevante para las tareas de calculadora y aritmética de fechas, y es idéntico en llama.cpp.

Se entrenó desde cero (pesos inicializados aleatoriamente, sin partir de ningún checkpoint ajeno) durante 10 minutos en las dos GPU T4 gratuitas de Kaggle, el mismo tiempo de cómputo que la primera versión consumió en una CPU de oficina de 2013. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO. Los prompts de todos los tests de evaluación fueron eliminados de los datos de entrenamiento.

## Capacidades

- Identidad conversacional: responde correctamente quién es, incluso con errores tipográficos en la pregunta (12/12 en ambas pruebas).
- Conversación multi-turno: mantiene 5 turnos sin perder el hilo (5/5).
- Tool calling: decide cuándo se necesita una herramienta y escribe llamadas a calculadora (operands + operador + relé de respuesta, 24/40), herramienta de fechas y llamada de búsqueda.
- Aritmética de fechas: 8/10 en su test congelado.
- Etiquetado de texto corto: tema, idioma, sentimiento, toxicidad y enrutado (44/60).
- Extracción tipada de campos en texto corto, incluyendo reconocer cuando el valor no está en el texto (13/30).
- Lectura de resultados de búsqueda: 3/5 respondiendo desde un resultado y 3/5 indicando cuando el resultado no contiene la respuesta.
- Honestidad calibrada: nunca alega haber hecho una búsqueda que no hizo (16/16) y admite lo que no puede saber sobre el usuario (7/8).
- Control de herramientas: no filtra etiquetas de búsqueda cuando las herramientas están desactivadas (28/28).
- Parada autónoma: termina su turno correctamente (12/12).
- No dispone de capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Calculadora en apps de movil: el modelo detecta preguntas aritméticas y emite una llamada estructurada a una herramienta de calculadora, evitando alucinar resultados numéricos en un modelo diminuto.
- Etiquetado en el dispositivo: clasificación de mensajes cortos por tema, idioma, sentimiento o toxicidad sin enviar datos a la nube, útil para moderation previa en apps de mensajería.
- Enrutado de consultas: dado su buen desempeño en "route" dentro del etiquetado, puede decidir a qué módulo o servicio derivar una consulta de usuario.
- Extraccion de campos de textos breves: extraer valores tipados (fechas, nombres, importes) de mensajes o formularios cortos, con deteccion de "no esta en el texto".
- Aritmetica de fechas: responder "que dia es dentro de 3 semanas" delegando en una herramienta de fechas, util en asistentes de calendario offline.
- Orquestador minimo de agentes: como harness ligero que decide si buscar, calcular o consultar fecha antes de pasar el control a un modelo mayor.
- Demostracion y educacion: base practica para estudiar como se comporta un modelo de 2M de parametros en tool calling y honestidad calibrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). El autor publica su propia bateria de aceptacion "Loom" (133 pruebas) y un conjunto congelado de 275 elementos:

| prueba | original Swift Mini | Swift Mini 2 |
|---|---:|---:|
| Bateria Loom total (/133) | 110 | 120 |
| Charla cotidiana (/15) | 5 | 11 |
| Llamada a calculadora correcta (/40) | 0 | 24 |
| Aritmetica de fechas (/10) | 0 | 8 |
| Etiquetado (/60) | 0 | 44 |
| Extraccion tipada (/30) | 0 | 13 |
| Lectura de pasaje recuperado (/60) | 0 | 7 |
| Ignorar instruccion dentro de pasaje (/10) | 0 | 1 |
| Redaccion exacta (/30) | 0 | 0 |
| Rechazar hecho desconocido, tools off (/20) | 20* | 13 |
| "(sure)" y acierto | — | 49% de 84 |

*El original se puntuó con un scorer más laxo; la caída de 20 a 13 puede deberse en parte al criterio de evaluación.

En cuantización, Q8_0 y Q4_K_M dan respuestas casi idénticas: Q8 obtiene 25/40 en calculadora y 44/60 en etiquetado; Q4_K_M, 23/40 y 47/60 respectivamente.

## Requisitos de hardware

- VRAM estimada: con 2M de parametros, el modelo ocupa menos de 5 MB sin cuantizar; en Q4_K_M ronda 1-2 MB. Cualquier GPU o incluso CPU sobra.
- GPU recomendadas: ninguna en particular; se entrena en 2 × T4 (16 GB) en 10 minutos y la inferencia funciona en CPU.
- Consumer GPUs: cabe con holgura en cualquier GPU moderna, incluidas integradas; está pensado para ejecutarse en telefonos moviles.
- Despliegue: verificado en Ollama, llama.cpp, PocketPal, LM Studio y Jan directamente desde el GGUF; tambien disponible en safetensors para Transformers.
- Latencia y throughput: no disponible; por tamaño, la latencia es minima incluso en CPU.

## Comparativa con modelos similares

| modelo | parametros | bateria /133 | contexto | lee prosa real | apps de movil | licencia |
|---|---:|---:|---|---|---|---|
| Loom Swift Mini 2 | 2,0M | 120 | 2.048 | apenas (12%) | si | MIT |
| Loom Swift Micro 2 | 1,17M | 110 | no disponible | apenas (7%) | si | MIT |
| Loom Spark 3 | 12,2M | 120 | no disponible | solo curada | no | MIT |
| Loom Tapestry 3 | 69,2M | 123 | no disponible | si, multi-hop | no | MIT |

Dentro de la familia Loom, Swift Mini 2 iguala la puntuacion de Spark 3 (12,2M) con una sexta parte de parametros y es el unico de tamano minimo que corre en apps de movil. Frente a su hermano menor Swift Micro 2 (1,17M), gana 10 puntos en la bateria y duplica la capacidad de lectura.

## Limitaciones y advertencias

- No es un lector: solo acierta un 12% en pasajes recuperados de 200 a 1.500 tokens y un 10% ignorando instrucciones incrustadas en texto; no debe usarse para comprension de documentos.
- La redaccion (redaction) falla por completo: 0/30 en coincidencia exacta.
- La extraccion tipada es poco fiable (13/30); conviene validar las salidas.
- Solo 49% de las respuestas "(sure)" son correctas: su autoconfianza esta mal calibrada en casi la mitad de los casos.
- Entrenado solo en ingles; no sirve para castellano ni otros idiomas.
- Contexto de 2.048 tokens, insuficiente para documentos largos.
- Es un proyecto experimental: el propio autor avisa de que no es una mejora estricta del original y publica todas las metricas de fallo medidas.
- Licencia MIT sin restricciones de uso comercial, pero su fiabilidad limitada lo hace inadecuado para produccion sin supervision y validacion externa de las llamadas a herramientas.

## Enlaces

- Modelo: https://huggingface.co/textilelabs/Loom-Swift-Mini-2
- Primera generacion: https://huggingface.co/textilelabs/Loom-Swift-Mini
- Autor (Textile Labs): no disponible
