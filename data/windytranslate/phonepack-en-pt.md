# WindyTranslate/phonepack-en-pt

## Resumen

`phonepack-en-pt` es un paquete de traducción inglés→portugués pensado para inferencia en dispositivo (on-device), publicado por WindyTranslate (Windstorm Labs) para el modo sin conexión de su producto Windy Traveler. No es un modelo entrenado desde cero: es una conversión a ONNX y una cuantización a int8 del modelo `WindyTranslate/translate-tc-big-en-pt` (revisión `a62035c`), que a su vez deriva del OPUS-MT `Helsinki-NLP/opus-mt-tc-big-en-pt` del grupo de Tecnología del Lenguaje de la Universidad de Helsinki. El paquete completo pesa 245,2 MB e incluye todo lo que un runtime necesita: pesos ONNX, una copia única del embedding compartido (`embed.bin`), un `pack.json` con los ficheros y sus sha256, la regla del tokenizador y los ajustes de decodificación.

Su relevancia es práctica: permite traducción neuronal automática sin GPU y sin conexión de red, con una calidad medida de chrF++ 69,9 y spBLEU 54,95 sobre las 1.012 frases completas de FLORES-200 devtest con beam 4. El autor compara ese resultado con la conversión a CTranslate2 int8 del mismo modelo (chrF++ 69,95), lo que sitúa al paquete ONNX en la misma horquilla de calidad que una alternativa de despliegue ya establecida. Incorpora además `test_vectors.json` con 20 frases de devtest, sus ids de token y las salidas esperadas, material pensado para validar portes del runtime a otras plataformas.

La model card no documenta el número de parámetros, la longitud de contexto ni la composición exacta del corpus de entrenamiento original; esta ficha marca esos datos como no disponibles en lugar de estimarlos. La licencia es CC-BY-4.0 y exige mantener el texto de atribución a WindyTranslate, Windstorm Labs y Helsinki-NLP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de traducción automática neuronal (familia OPUS-MT/Marian, según el modelo base); no detallada explícitamente en la model card |
| Parámetros totales | no disponible (el pack int8 completo, con embedding compartido, pesa 245,2 MB) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (modelo de traducción por frases; la model card no documenta una ventana máxima) |
| Tipos de cuantización | int8 (ONNX cuantizado); el pack distribuido solo contiene esta variante |
| Idiomas soportados | inglés (en) y portugués (pt); dirección en→pt |
| Licencia | CC-BY-4.0 (Creative Commons Attribution 4.0 International) |
| Formato de pesos | ONNX (`.onnx`) + `embed.bin` (embedding compartido almacenado una sola vez) + `pack.json` + `test_vectors.json` |
| Tarea (pipeline) | `translation` |
| Modelo base | `WindyTranslate/translate-tc-big-en-pt` @ `a62035c` |
| Modelo upstream | `Helsinki-NLP/opus-mt-tc-big-en-pt` (OPUS-MT, Universidad de Helsinki) |
| Autor / entidad | WindyTranslate (Windstorm Labs) |
| Tamaño del repositorio | 0,2 GB (descarga indicada: 245,2 MB) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación | 2026-10-17 |

## Arquitectura y entrenamiento

El paquete reproduce los pesos del modelo base `translate-tc-big-en-pt`, que pertenece a la familia OPUS-MT y, por tanto, a la arquitectura transformer encoder-decoder característica de estos sistemas de traducción neuronal. La model card no especifica el número de capas, la dimensión del modelo ni el número de cabezas de atención, y tampoco detalla el proceso de entrenamiento original (volumen de tokens, composición del corpus, técnicas de filtrado o fine-tuning). Lo que sí documenta el autor es el trabajo propio: conversión de los pesos a ONNX, cuantización a int8 y deduplicación del embedding compartido entre encoder y decoder, que se almacena una sola vez en `embed.bin` para reducir el tamaño del paquete.

No se menciona ningún proceso de alineación por preferencias (RLHF, DPO) ni innovaciones de decodificación más allá de los ajustes de búsqueda incluidos en `pack.json`; la evaluación publicada usa beam search con ancho 4. La reproducibilidad se apoya en dos mecanismos: los sha256 de cada fichero en `pack.json` y los 20 vectores de prueba de `test_vectors.json`, que permiten comprobar que un port del runtime produce exactamente los mismos ids de token y las mismas salidas que la implementación de referencia.

## Capacidades

- Traducción automática de texto de inglés a portugués, frase a frase, en modo totalmente offline.
- Inferencia en CPU y en dispositivos móviles o embebidos, sin dependencia de GPU ni de servicios en la nube.
- Distribución autocontenida: pesos, tokenizador, ajustes de decodificación y verificación de integridad en un único paquete de 245,2 MB.
- Verificación de portes de runtime mediante vectores de prueba con salidas esperadas deterministas.
- Decodificación configurable por beam search (la evaluación de referencia usa beam 4).
- No dispone de soporte documentado de tool calling ni de function calling.
- No es un modelo conversacional: no hay modo de razonamiento multi-paso, ni agentes, ni plantilla de chat documentada.
- Sin capacidades multimodales (visión, audio) ni modo "thinking".
- Multilingüismo limitado al par en→pt; no cubre la dirección inversa pt→en.

## Casos de uso

- Traducción offline en aplicaciones de viaje: es el escenario para el que se publicó el paquete (modo sin conexión de Windy Traveler); el modelo se embebe en la app y traduce avisos, menús o conversaciones puntuales cuando no hay cobertura, con 245,2 MB de huella en disco.
- Localización de cadenas de interfaz: integrado en un pipeline de build que traduce ficheros de recursos en→pt por lotes y valida la salida contra los vectores de prueba antes de publicar, lo que permite detectar regresiones de tokenización en cada actualización del runtime.
- Traducción de correos y tickets de soporte: el modelo procesa mensajes cortos en inglés y genera un borrador en portugués que un agente humano revisa; encaja porque el coste por frase es bajo en CPU y no requiere enviar el contenido a un tercero.
- Kioscos y dispositivos embebidos: instalación en terminales de autoservicio, paneles informativos o hardware ARM64 sin acelerador, usando ONNX Runtime en CPU con el paquete int8 como único artefacto a desplegar.
- Preprocesado y aumento de datos: traducción masiva de corpus ingleses a portugués para generar datos de entrenamiento o evaluar sistemas de recuperación, con la ventaja de que el throughput no depende de cuotas de API.
- Traducción de documentación técnica de producto: descripciones, notas de versión y guías breves en→pt con revisión humana posterior, aprovechando que el modelo base es un OPUS-MT de corpus paralelos y tiende a un registro neutro-formal.
- Prototipado de funcionalidades de traducción en navegador o escritorio: al ser un grafo ONNX, puede ejecutarse con runtimes ligeros en el cliente sin infraestructura de servidor.

## Benchmarks y rendimiento

| Benchmark | Conjunto | Configuración | Métrica | Resultado |
|---|---|---|---|---|
| FLORES-200 devtest (1.012 frases, en→pt) | devtest completo | beam 4 | chrF++ | 69,9 |
| FLORES-200 devtest (1.012 frases, en→pt) | devtest completo | beam 4 | spBLEU | 54,95 |
| Referencia: CTranslate2 int8 del mismo modelo | devtest completo | beam 4 | chrF++ | 69,95 |

Solo se han publicado estos resultados en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de otras tareas, que por otra parte no aplican a un sistema de traducción. Tampoco se ofrece comparación contra el modelo en fp32.

## Requisitos de hardware

- VRAM: no requiere GPU. El paquete int8 pesa 245,2 MB, por lo que el consumo de memoria en CPU se sitúa aproximadamente en el rango de 300-450 MB contando pesos, tokenizador y activaciones (estimación, no publicada por el autor).
- GPU recomendadas: ninguna. Un acelerador solo tendría sentido para procesar lotes grandes en servidor, y el autor no documenta ningún backend GPU para este pack.
- GPU consumer: no aplica; el modelo cabe holgadamente en cualquier sistema, pero está diseñado para CPU.
- CPU: cualquier x86-64 o ARM64 con un runtime ONNX; el caso de uso declarado son dispositivos móviles.
- Opciones de despliegue: ONNX Runtime con el paquete y `pack.json`; runtime propio de Windy Traveler; CTranslate2 si se parte del modelo base (es la alternativa con la que el autor compara la calidad). vLLM, TGI, llama.cpp u Ollama no son aplicables, al no tratarse de un modelo generativo con prompt conversacional.
- Latencia y throughput: no disponibles. La model card no publica tiempos por frase ni frases por segundo en ningún hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad en FLORES-200 en→pt | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| `WindyTranslate/phonepack-en-pt` | no disponible | no disponible | chrF++ 69,9 / spBLEU 54,95 (beam 4) | CC-BY-4.0 | ONNX int8, 245,2 MB, offline |
| `WindyTranslate/translate-tc-big-en-pt` (base) | no disponible | no disponible | no disponible (mismo checkpoint de origen) | CC-BY-4.0 | Pesos del framework original |
| CTranslate2 int8 de `translate-tc-big-en-pt` | no disponible | no disponible | chrF++ 69,95 (beam 4) | CC-BY-4.0 | CTranslate2 int8 |
| `Helsinki-NLP/opus-mt-tc-big-en-pt` (upstream) | no disponible | no disponible | no disponible en esta ficha | CC-BY-4.0 | Pesos originales de OPUS-MT |
| `Helsinki-NLP/opus-mt-en-pt` (OPUS-MT, variante estándar del mismo par) | no disponible | no disponible | no disponible en esta ficha | CC-BY-4.0 (según familia OPUS-MT) | Pesos originales de OPUS-MT |

La comparación relevante es interna: el pack ONNX int8 iguala esencialmente a la conversión CTranslate2 int8 del mismo modelo (diferencia de 0,05 puntos de chrF++), de modo que la elección entre ambos depende del runtime objetivo y no de la calidad. Frente al modelo upstream, la ventaja es el tamaño y la ausencia de dependencias; el coste es la pérdida inherente a la cuantización int8, no cuantificada en la documentación disponible.

## Limitaciones y advertencias

- Solo traduce en→pt. No cubre portugués→inglés ni ningún otro par.
- Es traducción por frases: no mantiene contexto entre frases y no debe usarse como sustituto de un modelo conversacional o de un sistema con memoria documental.
- El propio autor advierte de que la traducción automática requiere revisión humana para cualquier contenido relevante; los benchmarks no garantizan corrección en dominios especializados.
- Riesgo de errores en nombres propios, terminología técnica, siglas y frases ambiguas o muy cortas, habitual en sistemas NMT entrenados sobre corpus paralelos.
- Sesgos heredados del corpus OPUS (texto web y paralelo, con sobrerrepresentación de registros formales e institucionales); no hay auditoría de sesgo publicada.
- No se documentan filtros de seguridad ni moderación de contenido; el modelo traduce lo que recibe.
- La licencia CC-BY-4.0 obliga a atribuir a WindyTranslate/Windstorm Labs y a Helsinki-NLP, e incluye un texto de atribución concreto que la model card pide reproducir; conviene revisarlo antes de un uso comercial.
- El pack está cuantizado a int8 y no se publica comparación contra fp32, por lo que la magnitud de la degradación frente al modelo original es desconocida.
- Ausencia de validación externa: 0 descargas y 0 likes en el momento de la consulta, y una única fuente de evaluación (el propio autor).
- No hay garantía de mantenimiento, versionado del runtime ni soporte por parte del publicador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WindyTranslate/phonepack-en-pt
- Modelo base: https://huggingface.co/WindyTranslate/translate-tc-big-en-pt
- Modelo upstream OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-pt
- Windstorm Labs: https://windstormlabs.com
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
