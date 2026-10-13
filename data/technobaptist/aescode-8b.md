# TechnoBaptist/AesCode-8B

## Resumen

AesCode-8B es un modelo multimodal de generacion de codigo especializado en producir artefactos visuales ricos en informacion, como diapositivas, posters, dashboards e informes, en forma de HTML/CSS completo y editable. El modelo parte de Qwen3-VL-8B-Instruct y se distribuye en el repositorio `TechnoBaptist/AesCode-8B`. Su tarea objetivo es doble: mantener la salida estructurada, editable y verificable (propia de un modelo de codigo), a la vez que resuelve el problema de que los modelos de codigo no "ven" como interactuan maquetacion, jerarquia y color sobre el lienzo.

La propuesta tecnica combina una imagen de referencia generada a partir del mismo prompt (que aporta guia estetica) con el prompt de contenido (que fija los requisitos semanticos). Para que el modelo no copie contenido alucinado de la referencia ni ignore su maquetacion, AesCode separa requisitos semanticos de senales visuales mediante supervision con estructura de grafo y recompensas cross-modales desacopladas. El entrenamiento sigue un esquema de SFT de arranque en frio seguido de GDPO a traves de siete canales de recompensa.

Con 8.767.123.696 parametros (~8,77 B) y un contexto de referencia de 24.576 tokens, el modelo es relevante porque demuestra que un backbone de 8B puede superar, en su metrica agregada, a sistemas de frontera cerrados como GPT-5.5 o Claude Opus 4.8 cuando estos reciben la misma imagen de referencia, manteniendo ademas alta correccion verificable en las comprobaciones programaticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (familia `qwen3_vl`), pipeline `image-text-to-text` |
| Parametros totales | 8.767.123.696 (~8,77 B) |
| Longitud de contexto | 24.576 tokens (configuracion de referencia; `--max-model-len 24576`) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer vision-lenguaje construido sobre Qwen3-VL-8B-Instruct, por lo que hereda su interfaz de chat, su procesador multimodal y su capacidad de recibir imagenes junto a texto. Requiere `transformers>=4.57` y se carga mediante `AutoProcessor` y `AutoModelForImageTextToText`. La generacion produce un documento HTML completo; las tablas se emiten como estructuras de tabla HTML y los graficos como especificaciones ECharts, de modo que ambos quedan directamente inspeccionables y verificables desde el propio codigo.

El entrenamiento parte de un SFT de arranque en frio (cold-start SFT) y continua con GDPO sobre siete canales de recompensa. La innovacion central es el desacoplamiento de recompensas cross-modales junto con supervision con estructura de grafo, que separa los requisitos semanticos (contenido correcto) de las senales visuales (maquetacion y estilo aportados por la imagen de referencia). Segun la model card, este diseno internaliza la planificacion visual en la politica: retirar la referencia en inferencia cuesta solo 1,00 punto Visual en AesCode-8B, frente a 19,55 en el backbone Qwen3-VL-8B-Instruct y 10,04 en GPT-5.5. La imagen de referencia es, por tanto, opcional, aunque la calidad maxima se obtiene cuando se suministra.

## Capacidades

- Generacion de documentos HTML/CSS completos a partir de un prompt de contenido y, opcionalmente, una imagen de referencia.
- Produccion de artefactos visuales estructurados: diapositivas, posters, dashboards e informes.
- Tablas en estructuras HTML nativas y graficos como especificaciones ECharts, ambos verificables de forma programatica.
- Comprension de imagenes (entrada `image-text-to-text`) para usar la referencia como guia de maquetacion y estilo.
- Alineacion fiel al prompt de contenido, evitando copiar contenido alucinado de la imagen de referencia.
- Generacion bilingue: no disponible; el unico idioma declarado es ingles (en).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion automatica de dashboards de negocio: el modelo recibe un prompt con metricas y una referencia visual, y emite un HTML con tablas y graficos ECharts listos para publicar, manteniendo la salida editable y verificable.
- Creacion de diapositivas e informes corporativos: a partir de un resumen de contenido se obtiene una pagina HTML con jerarquia y color coherentes, que el equipo de diseno puede retocar directamente en el codigo.
- Prototipado rapido de posters y material de marketing: la referencia aporta el estilo de marca y el prompt fija los textos, numeros y relaciones logicas, evitando los errores tipicos de los generadores de imagen con cifras y texto.
- Investigacion en generacion de codigo multimodal: el modelo sirve como sistema de referencia para estudiar supervision con estructura de grafo y recompensas cross-modales desacopladas.
- Investigacion en diseno visual verificable: al emitir tablas HTML y especificaciones ECharts, permite comprobar de forma programatica la fidelidad de contenido, cotas y graficos.
- Automatizacion de informes periodicos: integrado en un pipeline que inyecta los datos del periodo y una referencia de plantilla, genera el informe en HTML para su publicacion directa.
- Generacion asistida de maquetacion web: util para producir esqueletos de pagina con contenido real estructurado, reutilizables como punto de partida en un proyecto front-end.

## Benchmarks y rendimiento

Evaluacion sobre 300 muestras de infografia. `Rule` promedia las comprobaciones programaticas de Text, Bound y Chart. `Visual` promedia las dimensiones de checklist Content, Layout y Style. `Overall` es la media de Rule y Visual. Los valores son porcentajes promediados sobre tres generaciones por prompt sin seleccion. `Ref.` indica si el modelo recibe una imagen de referencia generada junto al prompt.

| Modelo | Ref. | Text | Bound | Chart | Rule | Content | Layout | Style | Visual | Overall |
|---|:---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| GPT-5.5 | No | 88,67 | 86,18 | 82,85 | 85,90 | 79,27 | 68,09 | 52,80 | 66,72 | 76,31 |
| GPT-5.5 | Si | 89,22 | 86,85 | 81,35 | 85,80 | 82,44 | 89,93 | 57,91 | 76,76 | 81,28 |
| Claude Opus 4.8 | No | 91,40 | 85,03 | 87,69 | 88,04 | 84,98 | 64,88 | 46,72 | 65,53 | 76,78 |
| Claude Opus 4.8 | Si | 92,45 | 84,43 | 73,75 | 83,55 | 86,42 | 89,76 | 55,51 | 77,23 | 80,39 |
| Qwen3-VL-8B | No | 58,32 | 77,23 | 43,30 | 59,61 | 38,33 | 23,97 | 13,22 | 25,17 | 42,39 |
| Qwen3-VL-8B | Si | 64,07 | 70,99 | 42,35 | 59,14 | 52,90 | 51,33 | 29,92 | 44,72 | 51,93 |
| Qwen3-VL-32B | No | 66,00 | 80,31 | 41,36 | 62,55 | 49,81 | 34,85 | 19,34 | 34,67 | 48,61 |
| Qwen3-VL-32B | Si | 71,19 | 79,61 | 50,77 | 67,19 | 62,04 | 64,59 | 38,43 | 55,02 | 61,10 |
| AesCode-8B | Si | 94,06 | 88,36 | 87,79 | 90,07 | 86,41 | 87,80 | 53,21 | 75,80 | 82,94 |
| AesCode-32B | Si | 95,34 | 97,27 | 90,37 | 94,33 | 85,76 | 90,58 | 55,99 | 77,44 | 85,89 |

Segun la model card, AesCode-8B mejora Visual en 31,1 puntos y Overall en 31,0 respecto a su backbone Qwen3-VL-8B-Instruct condicionado por referencia. Su Overall de 82,94 supera a GPT-5.5 y Claude Opus 4.8 en su variante con referencia, mientras que Rule alcanza 90,07. Style es el techo compartido de todos los sistemas: ninguno supera 60.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 17,5 GB solo de pesos (17.5 GB de repositorio), mas overhead de activaciones y cache KV; en la practica se recomienda disponer de 20-24 GB o mas.
- VRAM estimada en cuantizacion INT8/FP8: alrededor de 9-10 GB (estimacion no confirmada por el autor).
- VRAM estimada en cuantizacion INT4: alrededor de 5-6 GB (estimacion no confirmada por el autor).
- GPUs recomendadas: A100 40/80 GB o H100 para servicio en BF16 con contexto largo; RTX 4090 (24 GB) puede alojar el modelo en BF16 con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 (24 GB) y, en configuraciones cuantizadas, en tarjetas de 12-16 GB (estimacion no confirmada).
- Opciones de despliegue confirmadas: `transformers` (>= 4.57) con `AutoModelForImageTextToText` y vLLM. Ejemplo de servicio: `vllm serve microsoft/AesCode-8B --limit-mm-per-prompt image=2 --max-model-len 24576`.
- Soporte en llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible. Los resultados reportados usan tres rollouts por prompt a temperatura 0,8, top-p 0,95, hasta 12.000 tokens de salida y un contexto de 24.576 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall (con ref.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-8B | ~8,77 B | 24.576 | 82,94 | Apache 2.0 | Pesos abiertos en HuggingFace |
| AesCode-32B | no disponible | no disponible | 85,89 | no disponible | Pesos abiertos (companion) |
| Qwen3-VL-8B-Instruct | ~8 B | no disponible | 51,93 | no disponible | Pesos abiertos (backbone) |
| Qwen3-VL-32B | ~32 B | no disponible | 61,10 | no disponible | Pesos abiertos |
| GPT-5.5 | no disponible | no disponible | 81,28 | Propietaria | Cerrado (API) |
| Claude Opus 4.8 | no disponible | no disponible | 80,39 | Propietaria | Cerrado (API) |

Nota: la comparativa de benchmarks se refiere a la tarea concreta de generacion de infografias HTML/CSS y no a capacidades generales de proposito abierto.

## Limitaciones y advertencias

- La model card lista Style como techo comun a todos los sistemas evaluados: ningun modelo supera 60 en esa dimension, lo que indica que la revision estetica humana sigue siendo necesaria antes de la entrega.
- Riesgo de alucinacion: aunque el diseno desacoplado busca evitar la copia de contenido de la referencia, el modelo puede emitir contenido o cifras incorrectas, especialmente sin una referencia clara.
- Idioma: el modelo solo declara soporte para ingles; no hay datos sobre su comportamiento en castellano ni en otros idiomas.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL-8B-Instruct por separado.
- Discrepancia de trazabilidad: el identificador facilitado es `TechnoBaptist/AesCode-8B`, mientras que el contenido de la model card hace referencia a `microsoft/AesCode-8B`, `microsoft/AesCode-32B` y al repositorio `github.com/microsoft/AesCode`. El campo `base_model` del repositorio apunta a `Qwen/Qwen3-VL-8B-Instruct`. Conviene confirmar la relacion exacta entre el repositorio listado y el modelo oficial de Microsoft antes de usarlo en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Requiere `transformers>=4.57`; versiones anteriores no son compatibles.
- La salida se limita a HTML/CSS (con tablas HTML y ECharts), por lo que no esta pensado para otros formatos de codigo o tareas generales de programacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechnoBaptist/AesCode-8B
- Modelo oficial de referencia en HuggingFace (segun la model card): https://huggingface.co/microsoft/AesCode-8B
- Modelo companion AesCode-32B: https://huggingface.co/microsoft/AesCode-32B
- Repositorio de codigo: https://github.com/microsoft/AesCode
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper citado en la model card: "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (sin URL en la informacion disponible)
- Perfil del autor: https://huggingface.co/TechnoBaptist/models
