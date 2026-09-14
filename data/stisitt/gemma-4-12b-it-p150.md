# stisiTT/gemma-4-12b-it-p150

## Resumen

gemma-4-12b-it-p150 es un paquete de despliegue experimental publicado por el usuario stisiTT que permite servir el modelo Google Gemma-4-12B-it en modo thinking sobre un único die Tenstorrent Blackhole P150, usando el plugin vLLM de Tenstorrent. No es un modelo nuevo ni un fine-tuning: es un contenedor con código de servicio, manifiesto y perfiles de ejecución, mientras que los pesos se descargan aparte desde el repositorio upstream google/gemma-4-12B-it en la revisión 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7.

El interés del paquete es de infraestructura: demuestra que un modelo de 12B en modo razonamiento puede servirse con un mesh 1x1 en aceleradores Blackhole, con servidor compatible con la API de OpenAI y ventana de contexto de hasta 65.536 tokens en el perfil por defecto. Está pensado como bring-up comunitario y experimental, no como una solución de producción: la configuración es de un solo usuario (TP=1), con muestreo en host y planificación asíncrona deshabilitada.

El único dato de evaluación publicado en la información disponible es GPQA Diamond en modo thinking con métrica exact_match: 71,7 % sobre 99 de los 198 documentos, frente al 78,8 % que Google reporta sobre el conjunto completo de 198. Al haberse evaluado solo la mitad del conjunto, las dos cifras no son directamente comparables. El modelo acumula 0 descargas y 0 likes en el momento de la consulta y no declara licencia ni idiomas en su ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; corresponde a la familia Gemma de Google (no se especifica si es transformer decoder-only) |
| Parametros totales | 12B (deducido del nombre del modelo; no confirmado explícitamente en la ficha) |
| Parametros activos | no aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | 65.536 tokens en el perfil `p150-eval` (por defecto); 4.096 tokens en `p150-smoke` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha de este paquete; el modelo base google/gemma-4-12B-it se rige por sus propios términos |
| Formato de pesos | no disponible; los pesos se descargan del repo upstream google/gemma-4-12B-it (no se confirma el formato exacto) |
| Desarrollador del paquete | stisiTT (publicación comunitaria) |
| Modelo base | google/gemma-4-12B-it, revisión 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7 |
| Modo de inferencia | thinking mode |
| Hardware objetivo | un die Tenstorrent Blackhole P150 (mesh 1x1), fabric deshabilitado |
| Herramienta de empaquetado | tt-model-manager 0.1.0 (manifest schema 5.1) |
| Tamaño del repositorio | 1,9 GB (imagen/contenedor; los pesos no están incluidos) |
| Fecha de creación | 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base ni sus datos de entrenamiento: no se indican número de tokens, composición del dataset ni si hubo RLHF, DPO u otra etapa de alineamiento. Lo único confirmado es que se trata de Google Gemma-4-12B-it, un modelo de 12.000 millones de parámetros en su variante instruction-tuned, servido en modo thinking, es decir, con generación de cadena de razonamiento antes de la respuesta final. No se menciona ninguna innovación de arquitectura (atención lineal, SSM, híbridos) ni mecanismos de decodificación especulativa.

Lo que sí está documentado es la pila de ejecución. El paquete fija TT-Metal en el commit 7d54a363f0cb5ccb0fc0ff8a63fb35398a4ba0b4 (árbol con cambios sin commitear incluidos en la imagen), vLLM v0.26.0 y vllm-tt-plugin en el commit bef89e429e202caa38d3e3c8a24da4e8cc02405a. El directorio `code/` del repositorio es byte a byte idéntico al código del modelo dentro de la imagen, con digest sha256 3bed9dc451aa0fb8 (primeros 16 dígitos hexadecimales), y la imagen se construyó el 2026-09-12T15:59:42+00:00 con tt-model 0.1.0. La configuración de servicio es deliberadamente conservadora: TP=1, mesh 1x1, fabric deshabilitado, muestreo en host y planificación asíncrona desactivada, lo que limita el despliegue a un único usuario concurrente.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con cadena de razonamiento previa a la respuesta.
- Razonamiento científico de nivel experto: el único benchmark publicado es GPQA Diamond (preguntas de posgrado en física, química y biología), con 71,7 % de exact_match sobre 99 documentos.
- Servicio mediante API compatible con OpenAI en el puerto 20000 (o el siguiente libre), lo que permite integrarlo con clientes y SDKs que ya hablan ese protocolo.
- Contexto largo de hasta 65.536 tokens en el perfil por defecto, adecuado para documentos extensos y conversaciones multi-turno largas.
- Capacidades de código, matemáticas y tool calling: no confirmadas en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo thinking es compatible con ese estilo de uso.
- Inferencia en acelerador Tenstorrent Blackhole P150, sin depender de CUDA.

## Casos de uso

- Evaluación de hardware Tenstorrent: el paquete sirve para medir si un único die Blackhole P150 puede sostener un modelo de 12B en modo thinking con 65.536 tokens de contexto, usando los perfiles `p150-eval` y `p150-smoke` como puntos de comparación reproducibles.
- Bring-up de kernels y del plugin vLLM: al fijar los commits exactos de TT-Metal y vllm-tt-plugin, es una base para reproducir fallos, comparar rendimiento entre revisiones y validar cambios en el backend antes de escalarlos a otros modelos.
- Prototipado de razonamiento científico: con GPQA Diamond como referencia, permite experimentar con prompts de thinking y estrategias de muestreo en tareas de física, química y biología sin depender de GPUs NVIDIA.
- Análisis de documentos largos en local: los 65.536 tokens de contexto admiten informes técnicos, patentes o expedientes completos en una sola pasada, con el servidor OpenAI-compatible como interfaz.
- Demostraciones y validación de despliegues no-CUDA: útil para equipos que quieren comprobar la viabilidad de servir un modelo de 12B en aceleradores Tenstorrent antes de comprometer infraestructura.
- Investigación en prompting y modo thinking: al ser un bring-up experimental con configuración de un solo usuario, es apropiado para estudiar cómo varía la calidad del razonamiento con distintas longitudes de contexto y formatos de prompt.
- Integración en pipelines internos de experimentación: cualquier herramienta que consuma una API estilo OpenAI (clientes Python, frameworks de evaluación, scripts de benchmarking) puede apuntar al puerto 20000 sin adaptadores específicos.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Este paquete | Google gemma-4-12B-it | Notas |
|---|---|---|---|---|
| GPQA Diamond (exact_match) | thinking mode | 71,7 % | 78,8 % | Este paquete evaluado sobre 99 de 198 documentos; la cifra de Google corresponde al conjunto completo de 198. No son comparables directamente |
| Resto de benchmarks (MMLU, HumanEval, GSM8K, etc.) | - | no disponible | no disponible | No se han publicado resultados en la información disponible |

Los resultados de búsqueda web asociados a esta consulta no contienen información técnica sobre el modelo: son páginas de ayuda de YouTube y preguntas de foros sin relación. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Hardware objetivo: un único die Tenstorrent Blackhole P150 con mesh 1x1 y fabric deshabilitado.
- En una plataforma p300c (dos dies P150 enlazados por ethernet) es obligatorio `GEMMA4_FABRIC=off`; el valor ya viene incluido en el entorno por defecto.
- Concurrencia: un solo usuario (TP=1, max_num_seqs=1), con muestreo en host y planificación asíncrona deshabilitada. No es un servidor multi-tenant.
- Arranque: la primera ejecución compila kernels para el dispositivo y tarda varios minutos; el servidor está listo cuando registra `Application startup complete`.
- Despliegue: herramienta `tt-model` (comandos `pull --with-weights` y `serve`), con perfiles `p150-eval` (por defecto, 65.536 tokens) y `p150-smoke` (4.096 tokens). Servidor compatible con OpenAI en el puerto 20000.
- Los pesos no van dentro de la imagen: `pull --with-weights` los descarga a la caché de HuggingFace desde google/gemma-4-12B-it.
- VRAM en GPU: este paquete no soporta despliegue en GPUs NVIDIA o AMD y la información disponible no documenta esa ruta. Como referencia genérica para un modelo de 12B (no verificada para este caso): en torno a 24 GB en BF16/FP16, 12-14 GB en 8 bits y 7-8 GB en 4 bits, más la memoria de la caché KV para el contexto configurado.
- GPU de consumo: no aplica a este paquete; los pesos upstream requerirían una GPU con memoria suficiente y un motor de inferencia distinto, no cubierto aquí.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / paquete | Parametros | Contexto | GPQA Diamond (thinking) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stisiTT/gemma-4-12b-it-p150 | 12B | 65.536 tokens (perfil por defecto) | 71,7 % sobre 99/198 documentos | no disponible | Paquete experimental para Blackhole P150; 0 descargas |
| google/gemma-4-12B-it | 12B | no disponible en la información proporcionada | 78,8 % sobre 198 documentos | no disponible en la información proporcionada | Modelo upstream en HuggingFace, pesos públicos |
| Otras alternativas de 12B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La única comparación sustentada por datos es contra el modelo upstream del que deriva este paquete. No hay información suficiente para comparar con otros modelos de tamaño o tarea similar sin inventar cifras.

## Limitaciones y advertencias

- Bring-up experimental y comunitario: no es un despliegue validado para producción ni cuenta con soporte oficial de Tenstorrent o Google.
- Un solo usuario concurrente: max_num_seqs=1, TP=1, muestreo en host y planificación asíncrona deshabilitada. No apto para servir tráfico concurrente.
- Evaluación parcial: el 71,7 % de GPQA Diamond se calculó sobre 99 de los 198 documentos, por lo que no es comparable con el 78,8 % de Google sobre el conjunto completo.
- Sin datos de otros benchmarks: no hay MMLU, HumanEval, GSM8K ni métricas de latencia o throughput publicadas.
- Licencia no declarada: la ficha del paquete no indica licencia, y el uso comercial depende de los términos del modelo base google/gemma-4-12B-it, que no se detallan aquí. Verificar antes de cualquier uso productivo.
- Idiomas no declarados: se desconoce el soporte multilingüe real de esta configuración.
- Riesgo de alucinación: inherente a los modelos de lenguaje en modo thinking; no se publican tasas de error ni evaluaciones de fidelidad.
- Sesgos: no se documenta ningún análisis de sesgo, toxicidad o alineamiento para este paquete.
- Dependencia de un árbol "dirty": la imagen se construyó sobre un TT-Metal con cambios sin commitear, lo que dificulta la reproducción exacta del binario.
- Metadatos atípicos: el repositorio figura creado el 2026-09-14, con 0 descargas y 0 likes, sin pipeline declarado. La madurez y el mantenimiento del proyecto no están garantizados.
- Los resultados de la búsqueda web asociada no aportan información técnica verificable sobre el modelo.

## Enlaces

- Repositorio del paquete: https://huggingface.co/stisiTT/gemma-4-12b-it-p150
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Herramienta de empaquetado tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Commit de TT-Metal usado en la imagen: https://github.com/tenstorrent/tt-metal/commit/7d54a363f0cb5ccb0fc0ff8a63fb35398a4ba0b4
- Versión de vLLM: https://github.com/vllm-project/vllm/releases/tag/v0.26.0
- Commit del plugin vLLM de Tenstorrent: https://github.com/tenstorrent/vllm-tt-plugin/commit/bef89e429e202caa38d3e3c8a24da4e8cc02405a
- Búsqueda web: no se encontraron enlaces técnicos relevantes; los resultados devueltos corresponden a páginas de ayuda de YouTube y foros sin relación con el modelo.
