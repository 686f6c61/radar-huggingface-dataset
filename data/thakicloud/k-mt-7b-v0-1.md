# ThakiCloud/K-MT-7B-v0.1

## Resumen

K-MT-7B v0.1 es un ajuste fino del modelo de traducción tencent/Hy-MT2-7B desarrollado por ThakiCloud, orientado a que las traducciones hacia coreano respeten instrucciones explícitas sobre nivel de habla (nivel de cortesía), términos de tratamiento (호칭), relación entre interlocutores y terminología. El problema que aborda es concreto: el modelo base traduce correctamente pero ignora esas restricciones cuando se le piden por prompt. La ficha del autor documenta 461 unidades de restricción evaluadas, de las cuales 346 son casos en los que el base incumplía la instrucción y K-MT-7B la cumple, sin ningún caso en sentido contrario.

Técnicamente es un transformer denso de 7.504.568.320 parámetros (≈7,5 mil millones) con arquitectura `hunyuan_v1_dense`, distribuido como un único checkpoint bf16 fusionado (no como adaptador). El entrenamiento consistió en un LoRA de 54,5 millones de parámetros entrenables (≈0,73 % del total) sobre datos coreanos dirigidos por fallos más un *capability replay* con peso 0,3, posteriormente fusionado en los pesos base. Se distribuye bajo licencia Apache-2.0 y con pesos en safetensors.

Su relevancia actual es acotada pero clara: cubre un hueco muy específico de la traducción EN↔KO en contexto empresarial, donde el registro y el tratamiento no son opcionales, y lo hace como sustituto directo (*drop-in*) del modelo base sin degradar la traducción multilingüe general. La adopción en el momento de redactar esta ficha es mínima (34 descargas, 0 likes) y el propio autor advierte de que el *benchmark* público fuera de dominio para la capacidad coreana todavía está en construcción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `hunyuan_v1_dense` (transformer denso; requiere `trust_remote_code=True`) |
| Parametros totales | 7.504.568.320 (≈7,5 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio publica un unico checkpoint bf16 fusionado, sin GGUF, AWQ ni GPTQ oficiales |
| Idiomas soportados | ko y en declarados en metadatos; el modelo base es multilingue y la retencion se verifico como agregado de 28 direcciones FLORES (sin superioridad por direccion) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, checkpoint fusionado; no es un adaptador LoRA) |

Otros datos: tamano del repositorio 15,0 GB; pipeline declarado `translation`; libreria `transformers`; modelo base `tencent/Hy-MT2-7B` (relacion: finetune); plantilla de chat en `chat_template.jinja` del repositorio (la misma que el base).

## Arquitectura y entrenamiento

El modelo parte de `tencent/Hy-MT2-7B`, un transformer denso de la familia `hunyuan_v1_dense`, y no modifica la arquitectura: solo los pesos. El ajuste se hizo con LoRA sobre 54,5 millones de parámetros entrenables y se fusionó después en un único conjunto de pesos bf16, de modo que en inferencia no hay adaptador ni sobrecoste de latencia asociado. El objetivo declarado no era mejorar la puntuación general de traducción, sino adquirir comportamiento de seguimiento de instrucciones en coreano preservando la capacidad multilingüe previa.

Los datos de entrenamiento son datos coreanos dirigidos por fallos (*failure-driven*), es decir, seleccionados a partir de errores concretos del modelo base, más un *capability replay* con peso 0,3 para evitar el olvido catastrófico. La fuente de replay es una exportación CC0 de Tatoeba, con los propios outputs del modelo base como referencias, y el autor afirma explícitamente que no se incluyó ningún texto de FLORES en el entrenamiento (FLORES se reserva para medir retención). No se documenta en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO. La evaluación se realizó con decodificación greedy (`do_sample=False`), idéntica a la empleada en el ejemplo de uso, lo que facilita reproducirla.

## Capacidades

- Traduccion EN↔KO de documentos de negocio, con calidad general declarada como equivalente a la del modelo base.
- Seguimiento de instrucciones de nivel de habla en coreano: `종결어미는 합니다체로 통일`, ademas de 해요체 y 하십시오체, entre otros.
- Seguimiento de instrucciones de tratamiento: `청자 호칭은 '본부장님'을(를) 사용`.
- Seguimiento de instrucciones de relacion entre interlocutores: por ejemplo `화자와 청자의 관계는 부하→상사`.
- Terminologia controlada mediante el prefijo `Reference the following translations:\ndeployment translates to 배포`, que fuerza un glosario por prompt.
- Tratamiento del nivel de habla y del tratamiento como ejes independientes, ambos verificados por separado.
- Comportamiento por defecto: sin instrucciones adicionales traduce de forma normal y no inserta terminos de tratamiento no solicitados (medido aparte por el autor).
- Preservacion multilingue: retencion comprobada como agregado sobre 28 direcciones FLORES, sin reclamar superioridad por direccion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes, razonamiento multi-paso, modo thinking, vision o audio: no disponible; el autor indica explicitamente que es un modelo de traduccion, no un modelo de chat.

## Casos de uso

- Traduccion de comunicaciones internas corporativas EN→KO con registro fijo: se especifica el nivel de habla exigido por la politica de comunicacion de la empresa y el modelo produce el texto completo con esa terminacion, algo que el base no garantiza.
- Localizacion de documentacion de producto con terminologia controlada: inyectando un glosario en el prompt (por ejemplo `deployment translates to 배포`), el traductor mantiene la coherencia terminologica entre cadenas sin necesidad de post-edicion manual.
- Traduccion de correos y mensajes dirigidos a un interlocutor concreto: la instruccion de tratamiento (`청자 호칭은 '박 매니저님'을(를) 사용`) hace que el texto generado se dirija explicitamente a esa persona, util en bandejas de soporte o CRM.
- Adaptacion de respuestas de atencion al cliente a registro formal: usando 합니다체 se obtiene un tono adecuado para comunicaciones oficiales, mientras que 해요체 sirve para canales mas cercanos, sin cambiar de modelo.
- Traduccion KO→EN de mensajes coreanos para equipos globales: el modelo conserva el pipeline de traduccion bidireccional del base y anade control sobre como se reformula el contenido coreano en ingles.
- Generacion de borradores en pipelines de localizacion: al ser un sustituto directo del base con la misma API de `transformers`, puede insertarse como etapa de pre-traduccion que un revisor humano valida despues.
- Traduccion de notas de reunion con jerarquia explicita: la restriccion `화자와 청자의 관계는 부하→상사` permite que el texto refleje la direccion de la comunicacion, relevante en actas y resumenes internos.
- Migracion de un stack existente sin cambios de integracion: al mantener arquitectura, plantilla de chat y licencia del base, sustituir el identificador del modelo es suficiente si ya se usaba `trust_remote_code=True`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El autor advierte de que el conjunto de evaluacion coreano es *in-domain* (generado por el mismo pipeline de minado que los datos de entrenamiento) y de que el benchmark publico fuera de dominio esta en construccion.

La evidencia disponible es cualitativa y procede de la model card, con el mismo prompt y decodificacion greedy para ambos modelos:

| Restriccion | Fuente (EN) | Hy-MT2-7B (base) | K-MT-7B v0.1 |
|---|---|---|---|
| Tratamiento `정 책임님`, 해요체 | CSAT held up pretty well even with the outage we had last week. | 지난주에 발생한 서비스 중단에도 불구하고 CSAT 점수는 꽤 양호한 수준을 유지했어요. (sin tratamiento) | 정 책임님, 지난주에 발생한 장애가 있었음에도 CSAT가 꽤 잘 유지되었어요. |
| Tratamiento `박 매니저님`, 해요체 | Attrition dropped a lot after we rolled out the retention program. | 유지 프로그램을 도입한 이후로 이탈률이 상당히 줄었어요. (sin tratamiento) | 박 매니저님, 유지 프로그램을 도입한 후 이탈률이 크게 줄었어요. |
| Tratamiento `대표님`, 합니다체 | I will send the report after the meeting ends. | 회의가 끝난 후에 보고서를 보내드리겠습니다. (sin tratamiento) | 회의가 끝난 후에 보고서를 보내겠습니다, 대표님 |
| Tratamiento `팀장님`, 합니다체 | Did you finish reviewing the migration plan? | 이주 계획 검토를 마치셨나요, 팀장님? (termina en 해요체, no en 합니다체) | 팀장님, 마이그레이션 계획 검토를 완료하셨습니까? |

Balance agregado declarado: de 461 unidades de restriccion, 346 son casos en los que el base fallaba la instruccion y K-MT-7B la cumple; ninguno en sentido contrario. No se aportan cifras de MMLU, HumanEval, GSM8K, BLEU, COMET ni metricas equivalentes.

## Requisitos de hardware

- Inferencia en bf16: los pesos ocupan aproximadamente 15 GB (el repositorio pesa 15,0 GB), por lo que se necesitan alrededor de 16-18 GB de VRAM contando cache KV y activaciones en secuencias moderadas.
- GPU de datacenter recomendadas: A100 40 GB u 80 GB, H100, L40S, A6000 48 GB.
- GPU de consumo: cabe en RTX 4090 / RTX 3090 (24 GB) en bf16; con cuantizacion de 8 bits bastarian unos 8-9 GB y con 4 bits unos 4-5 GB, lo que lo situaria en el rango de una RTX 3060 de 12 GB, si bien no hay cuantizaciones oficiales publicadas y habria que generarlas (bitsandbytes, GPTQ o AWQ).
- Longitud de contexto: no disponible; el consumo de memoria escala con la longitud de secuencia y no se documenta una ventana maxima util.
- Opciones de despliegue: la unica via validada por el autor es `transformers`, con `trust_remote_code=True` y `device_map="auto"`. No hay informacion sobre soporte en vLLM, TGI, llama.cpp u Ollama; la conversion a GGUF depende de que exista implementacion de `hunyuan_v1_dense` en esos motores, dato no disponible.
- Latencia y throughput: no disponible. El autor recomienda decodificacion greedy (`do_sample=False`) con `max_new_tokens=256` para reproducir la evaluacion.
- Nota operativa: al requerir codigo remoto del repositorio, conviene auditar los ficheros de modelado antes de desplegarlo en entornos con politicas de seguridad estrictas.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma / tarea | Control de registro y tratamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K-MT-7B v0.1 (ThakiCloud) | 7,5 B | Traduccion EN↔KO con instrucciones | Si, verificado en 346 unidades de restriccion | Apache-2.0 | Hugging Face, `transformers` |
| tencent/Hy-MT2-7B (base) | 7,5 B | Traduccion multilingue | No: ignora las instrucciones de tratamiento y nivel de habla segun la evaluacion del autor | Apache-2.0 | Hugging Face |
| Otras alternativas de traduccion de 7-8 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables de otros modelos comparables (por ejemplo, alternativas multilingues de 7-8 B orientadas a traduccion) que permitan una comparacion de parametros, contexto y rendimiento con cifras.

## Limitaciones y advertencias

- Los numeros coreanos son *in-domain*: el conjunto de evaluacion y los datos de entrenamiento provienen del mismo pipeline de minado, por lo que el balance de 346/461 no debe leerse como rendimiento general.
- No existe todavia un benchmark publico fuera de dominio para la capacidad especifica en coreano; el autor afirma que esta en construccion.
- La retencion multilingue se midio solo como agregado de 28 direcciones FLORES y no se reclama superioridad por direccion; el rendimiento en pares sin coreano no esta verificado individualmente.
- Dominio limitado a documentos de negocio: texto literario, medico y legal no han sido probados.
- No es un modelo de chat ni un asistente conversacional; usarlo como tal queda fuera del alcance previsto.
- Riesgo de alucinacion y de terminologia forzada: si el glosario o el tratamiento indicados en el prompt son incorrectos, el modelo los aplicara igualmente, ya que obedece la instruccion por diseno.
- Sesgos: no documentados en la informacion disponible; el modelo hereda los del base `tencent/Hy-MT2-7B`, que tampoco se detallan.
- Cobertura parcial: solo se evaluaron cuatro tipos de restriccion (nivel de habla, tratamiento, relacion y terminologia) y un subconjunto de niveles de habla.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio y puede bloquear el despliegue en plataformas con sandboxing estricto o impedir el uso en motores que no soporten codigo personalizado.
- Licencia Apache-2.0, sin restricciones conocidas para uso comercial; el modelo base tambien es Apache-2.0. No se documentan obligaciones adicionales de atribucion mas alla de las de la propia licencia.
- Adopcion muy baja (34 descargas, 0 likes) y ausencia de validacion independiente: conviene tratar los resultados como evidencia del propio autor hasta que existan replicaciones.
- Los metadatos del repositorio indican fechas de creacion y actualizacion de septiembre de 2026, con una diferencia de menos de media hora entre ambas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/K-MT-7B-v0.1
- Model card en coreano (`MODEL_CARD.ko.md`): https://huggingface.co/ThakiCloud/K-MT-7B-v0.1/blob/main/MODEL_CARD.ko.md
- Modelo base `tencent/Hy-MT2-7B`: https://huggingface.co/tencent/Hy-MT2-7B
- Fuente de replay Tatoeba (exportacion CC0): referenciada en la model card sin enlace directo; no disponible
- Conjunto de evaluacion FLORES (28 direcciones): referenciado en la model card sin enlace directo; no disponible
- Resultados de busqueda web: los unicos resultados devueltos corresponden a foros de desarrollo de Roblox y no guardan relacion con este modelo; no aportan enlaces relevantes.
