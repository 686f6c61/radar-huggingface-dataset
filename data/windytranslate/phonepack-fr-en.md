# WindyTranslate/phonepack-fr-en

## Resumen
WindyTranslate/phonepack-fr-en es un paquete de traducción francés→inglés para ejecución en dispositivo, distribuido en ONNX con cuantización int8. Deriva de WindyTranslate/translate-tc-big-fr-en, que a su vez se basa en el modelo OPUS-MT Helsinki-NLP/opus-mt-tc-big-fr-en. El paquete pesa 243,4 MB e incluye los pesos, un embedding compartido almacenado una sola vez (`embed.bin`), el tokenizador y la configuración de decodificación en `pack.json`.

El objetivo es habilitar traducción offline en aplicaciones de viaje y entornos con recursos limitados, sin depender de servicios en la nube. La model card reporta una evaluación sobre FLORES-200 devtest completo —1.012 frases, beam 4— con chrF++ 67,44 y spBLEU 49,39. Como referencia, una conversión CTranslate2 int8 del mismo modelo obtiene chrF++ 67,53.

La información disponible no detalla la arquitectura interna, el número de parámetros ni la longitud de contexto. Sí se especifica que el modelo base es OPUS-MT de Helsinki-NLP y que Windstorm Labs modificó los pesos originales antes de convertirlos a ONNX e int8.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | No disponible; derivado de OPUS-MT (Helsinki-NLP/opus-mt-tc-big-fr-en) según la model card |
| Parametros totales | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 en ONNX; se menciona CTranslate2 int8 solo como referencia comparativa |
| Idiomas soportados | Francés (fr) → inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX int8, `embed.bin`, `pack.json`, `test_vectors.json` |
| Tamano del paquete | 243,4 MB de descarga; repositorio de 0,2 GB |
| Modelo base | WindyTranslate/translate-tc-big-fr-en, commit `4df75aa` |
| Pipeline | Traducción |

## Arquitectura y entrenamiento
La model card no describe la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El paquete no entrena un modelo nuevo: convierte a ONNX y cuantiza a int8 los pesos de WindyTranslate/translate-tc-big-fr-en, que a su vez deriva del modelo OPUS-MT Helsinki-NLP/opus-mt-tc-big-fr-en. Windstorm Labs indica que modificó los pesos upstream y que este paquete añade la conversión a ONNX y la cuantización int8.

La innovación práctica está en el formato de distribución: el embedding compartido se almacena una sola vez en `embed.bin`, y `pack.json` concentra los ficheros con sus hashes SHA-256, la regla del tokenizador y los ajustes de decodificación. También se incluye `test_vectors.json` con 20 frases de devtest, sus ids de tokens esperados y las salidas, para validar portes a otros runtimes. La evaluación reportada usa beam 4 sobre las 1.012 frases de FLORES-200 devtest.

## Capacidades
- Traducción directa de francés a inglés.
- Ejecución local y offline en dispositivos con recursos limitados.
- Distribución en ONNX int8 con pesos de 243,4 MB.
- Embedding compartido almacenado una sola vez para reducir el tamaño del paquete.
- Configuración de tokenizador y decodificación incluida en `pack.json`.
- Vectores de prueba para verificar implementaciones y portes.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- El soporte multilingüe se limita al par fr→en indicado.

## Casos de uso
- Traducción offline en aplicaciones de viaje: el paquete puede integrarse en el modo sin conexión de una app para traducir frases y textos breves de francés a inglés sin enviar datos a la nube, gracias a sus 243,4 MB y formato ONNX int8.
- Traducción en dispositivos móviles y edge: al pesar menos de 250 MB, es adecuado para ejecutarse en teléfonos, tabletas o dispositivos embebidos con ONNX Runtime, siempre que la aplicación gestione el ciclo de vida del modelo y la memoria.
- Preprocesamiento local de documentos: un pipeline de escritorio puede convertir correos, notas o formularios en francés a inglés antes de indexarlos o analizarlos, manteniendo los datos en la máquina del usuario.
- Atención al cliente con revisión humana: el modelo puede generar una primera traducción de mensajes fr→en para agentes que trabajan con clientes francófonos; la model card recomienda revisión humana para cualquier contenido relevante.
- Herramientas de privacidad: traducción de comunicaciones internas en entornos donde no está permitido enviar texto a APIs externas, usando inferencia local con ONNX Runtime.
- Prototipos de investigación y evaluación: los `test_vectors.json` y la evaluación FLORES-200 permiten comprobar portes a nuevos runtimes y comparar la calidad de la cuantización int8 frente a otras conversiones.
- Integración en aplicaciones de escritorio: un editor o cliente de correo puede incorporar traducción fr→en bajo demanda mediante un runtime ONNX, sin depender de conectividad.

## Benchmarks y rendimiento
| Evaluación | Métrica | Resultado |
|---|---|---|
| FLORES-200 devtest, 1.012 frases, beam 4 | chrF++ | 67,44 |
| FLORES-200 devtest, 1.012 frases, beam 4 | spBLEU | 49,39 |
| Referencia: CTranslate2 int8 del mismo modelo | chrF++ | 67,53 |

No se han publicado otros resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval o GSM8K, que no corresponden a la tarea de traducción de este paquete.

## Requisitos de hardware
- Los pesos int8 ocupan 243,4 MB; el repositorio completo ocupa 0,2 GB.
- VRAM estimada: no publicada. Por el tamaño de los pesos, el modelo cabe holgadamente en menos de 1 GB de memoria, pero el consumo adicional depende del runtime, del tamaño de lote y de la longitud de las frases.
- GPU recomendadas: no hay una lista oficial. Para servidor no se requieren A100 ni H100; para cliente, cualquier GPU con soporte ONNX Runtime y memoria suficiente para el runtime debería poder cargar el paquete, aunque no se confirma una lista de modelos verificados.
- Cabe en GPU consumer: sí, por el tamaño de 243,4 MB. Es adecuado para CPU, iGPU y GPU de gama baja; conviene validar el rendimiento con el runtime concreto.
- Opciones de despliegue: ONNX Runtime. CTranslate2 se menciona solo como referencia de conversión y comparación, no como formato incluido. vLLM, TGI, llama.cpp y Ollama no aplican a este formato de traducción ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| WindyTranslate/phonepack-fr-en | No disponible | No disponible | CC-BY-4.0 | ONNX int8 | chrF++ 67,44 en FLORES-200 devtest |
| WindyTranslate/translate-tc-big-fr-en (base) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Helsinki-NLP/opus-mt-tc-big-fr-en (upstream) | No disponible | No disponible | CC-BY-4.0 según la atribución | No disponible | No disponible |

No se dispone de datos de modelos alternativos comparables en la información proporcionada. La comparación útil más directa es con el modelo base y con la conversión CTranslate2 int8 citada en la model card, que obtiene chrF++ 67,53 frente a 67,44 de este paquete.

## Limitaciones y advertencias
- La traducción automática requiere revisión humana para cualquier uso relevante; la propia model card lo indica.
- Solo cubre francés→inglés; no se documentan otros pares de idiomas.
- No hay información sobre sesgos, dominios de entrenamiento ni comportamiento en textos especializados.
- Puede producir traducciones incorrectas o poco naturales; no debe usarse sin control en contextos médicos, legales o de seguridad.
- La cuantización int8 puede introducir una degradación pequeña frente a los pesos originales; la referencia CTranslate2 int8 muestra 67,53 frente a 67,44 en chrF++.
- No se detalla la longitud de contexto ni el comportamiento con documentos largos; la evaluación se hizo sobre frases de FLORES-200.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es obligatorio conservar la atribución a WindyTranslate, Windstorm Labs y Helsinki-NLP, y enlazar la licencia.
- No hay información sobre alineación de seguridad, filtros de contenido ni robustez frente a entradas adversarias.

## Enlaces
- https://huggingface.co/WindyTranslate/phonepack-fr-en
- https://huggingface.co/WindyTranslate/translate-tc-big-fr-en
- https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-fr-en
- https://windstormlabs.com
- https://creativecommons.org/licenses/by/4.0/
