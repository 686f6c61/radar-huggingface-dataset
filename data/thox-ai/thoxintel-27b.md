# Thox-ai/ThoxIntel-27B

## Resumen

ThoxIntel-27B es una distribución configurada por THOX.ai de unos pesos comunitarios derivados de Qwen3.6-27B. No se trata de un modelo entrenado por THOX: los pesos provienen de un linaje de fusiones con mergekit sobre fine-tunes de la familia Qwen3.6-27B realizados por DavidAU, Nightmedia y Armand0E, varios de ellos variantes "Heretic" sin censura. THOX aporta únicamente la capa de servicio: selección y empaquetado del build GGUF, un Modelfile propio con plantilla ChatML, parámetros de muestreo y tokens de parada, un system prompt propio y el emparejamiento del proyector de visión mmproj de Qwen3.6.

El artefacto se distribuye como un GGUF Q4_K_M de 18.047.255.072 bytes (unos 18 GB) con arquitectura declarada `qwen35` y 851 tensores, acompañado de un proyector de visión F16 de 927.607.360 bytes (unos 927 MB) con proyector `qwen3vl_merger`. El contexto declarado a nivel de pesos es de 262.144 tokens, aunque la configuración servida por defecto fija `num_ctx` en 32.768 tokens; esta última es la cifra operativa y la primera no ha sido validada por THOX.

Es relevante ahora por dos motivos. Primero, porque ejemplifica una práctica creciente en el ecosistema open source: la redistribución de pesos comunitarios con una capa de configuración de serving, donde la autoría real de los pesos queda en terceros. Segundo, porque su estado de publicación es incompleto: a fecha de creación de la ficha no existe descarga pública ni listado en Ollama, el repositorio contiene únicamente un archivo `.gitattributes` y no se ha ejecutado ninguna suite de evaluación sobre el artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (GGUF), 851 tensores; transformer derivado de Qwen3.6-27B |
| Parametros totales | clase 27B (cifra exacta no disponible) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 262.144 tokens declarados a nivel de pesos; 32.768 tokens servidos por defecto (`num_ctx` del Modelfile) |
| Tipos de cuantizacion | Q4_K_M GGUF (18.047.255.072 bytes); proyector de visión en F16 GGUF (927.607.360 bytes) |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (pesos principales y proyector mmproj) |

## Arquitectura y entrenamiento

La arquitectura declarada en el GGUF es `qwen35`, correspondiente a la familia Qwen3.6-27B, con 851 tensores. El modelo es multimodal texto-imagen: el pipeline es `image-text-to-text` y el build empareja un proyector de visión `qwen3vl_merger` en F16 mediante el manifiesto del build. No se dispone de detalles adicionales sobre configuración de capas, atención o mecanismos internos más allá de la etiqueta de arquitectura.

El entrenamiento no fue realizado por THOX. Los pesos son una fusión con mergekit de fine-tunes de la línea Qwen3.6-27B atribuidos a DavidAU, Nightmedia y Armand0E, con siete entradas en el linaje según la model card. Varios componentes del linaje son fine-tunes "Heretic" sin censura, lo que reduce el comportamiento de rechazo respecto al modelo base original. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. THOX tampoco ha realizado safety tuning sobre los pesos.

## Capacidades

- Generación de texto y razonamiento multi-paso, con orientación a cadenas de razonamiento largas (etiqueta `long-cot` y `reasoning`).
- Razonamiento sobre código y trabajo con documentos, según el uso previsto declarado por el autor.
- Entrada de imágenes a través del proyector de visión emparejado; la verificación de la sonda de imagen por parte de THOX está pendiente según la model card.
- Multilingüe en inglés, chino, japonés y español.
- Comportamiento de rechazo reducido respecto al base, por la presencia de fine-tunes sin censura en el linaje.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso orquestado: no disponible en la información proporcionada (el uso previsto menciona análisis multi-paso, pero no se documenta integración de agentes).
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Análisis multi-paso sobre documentación técnica en local: el modelo está pensado para escenarios donde la calidad de respuesta prima sobre la latencia, con 32.768 tokens de contexto servidos que permiten cargar documentos extensos y razonar sobre ellos en una sola sesión.
- Revisión y razonamiento sobre código en estaciones de trabajo: el uso previsto incluye razonamiento de código, y el formato GGUF Q4_K_M de ~18 GB permite ejecutarlo en hardware de operador sin depender de APIs externas.
- Procesamiento de documentos con imágenes intercaladas: al emparejar el proyector `qwen3vl_merger`, el build está preparado para tareas image-text-to-text como extracción de información de capturas, diagramas o páginas escaneadas, siempre que se valide la sonda de imagen pendiente.
- Investigación y evaluación de linajes de fusión comunitarios: el artefacto sirve como caso de estudio de merges con mergekit y de distribución con capa de serving, bajo los guardrails propios del operador.
- Despliegue local-first con datos sensibles: la combinación de pesos abiertos Apache-2.0 y ejecución en hardware propio encaja en entornos donde los datos no pueden salir de la infraestructura del operador.
- Experimentación multilingüe en inglés, chino, japonés y español: útil para prototipos de asistentes o análisis de contenido en esos cuatro idiomas, con la advertencia de que no hay benchmarks publicados que respalden la calidad por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que THOX no ha ejecutado ninguna suite de evaluación sobre este artefacto y que los resultados se imprimirán cuando se midan, marcándose como pendientes hasta entonces.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 18.047.255.072 bytes (~16,8 GiB); sumando el proyector F16 (~0,86 GiB) y el contexto KV, se necesita aproximadamente 18-20 GiB de VRAM para el contexto servido por defecto. Con 32.768 tokens de contexto la caché KV añade varios GiB adicionales según el backend.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU de 24 GB (RTX 3090, RTX 4090) es el mínimo razonable para el build completo con contexto moderado, y A100/H100 para contextos largos o serving concurrente.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB o más con cuantización Q4_K_M y contexto ajustado; en tarjetas de 16 GB requeriría cuantizaciones más agresivas no publicadas o descarga parcial a RAM.
- Opciones de despliegue: el artefacto es GGUF con Modelfile, por lo que el backend natural es llama.cpp y Ollama; vLLM y TGI no están documentados para este build en la información disponible. La distribución está pendiente: no hay descarga pública ni listado en Ollama a fecha de la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxIntel-27B | clase 27B | 262.144 declarados / 32.768 servidos | Apache-2.0 | Build en staging, sin descarga pública | Merge comunitario con capa de serving de THOX; visión vía mmproj |
| Qwen3.6-27B (base) | clase 27B | no disponible | no disponible | Modelo base upstream | Modelo original del linaje; refusal estándar |
| Fine-tunes del linaje (DavidAU, Nightmedia, Armand0E) | clase 27B | no disponible | no disponible | Repositorios comunitarios | Componentes individuales del merge; varios sin censura |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Comportamiento de rechazo reducido: el linaje incluye fine-tunes "Heretic" sin censura, por lo que el modelo puede producir contenido que el base rechazaría. No debe exponerse a usuarios finales sin una capa de seguridad propia.
- Sin safety tuning: THOX no ha aplicado alineamiento de seguridad sobre los pesos.
- Sin evaluación: no existe ninguna suite de benchmarks ejecutada sobre este artefacto; cualquier afirmación de calidad es una extrapolación del linaje, no una medición.
- Verificación de visión pendiente: la sonda de imagen del proyector mmproj no ha sido validada por THOX según la model card.
- Contexto: los 262.144 tokens son un valor declarado a nivel de pesos, no un máximo servido evaluado; la configuración por defecto sirve 32.768 tokens.
- Distribución incompleta: el repositorio contiene solo `.gitattributes`; no hay pesos descargables ni listado en Ollama, y las instrucciones de ejecución están pendientes.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos de razonamiento de esta escala.
- Uso fuera de alcance: decisiones médicas, legales, financieras o de seguridad sin revisión humana cualificada, y control no supervisado de dispositivos físicos o actuadores sin paso de confirmación.
- Licencia Apache-2.0 sobre los pesos, pero la autoría real es de terceros del linaje comunitario; conviene revisar las condiciones de cada componente antes de un uso comercial en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thox-ai/ThoxIntel-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorios de los autores del linaje (DavidAU, Nightmedia, Armand0E): no disponible en la información proporcionada
- Paper, blog o demo de THOX.ai: no disponible en la información proporcionada
- Listado en Ollama: no disponible (no existe a fecha de la model card)
