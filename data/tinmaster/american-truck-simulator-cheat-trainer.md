# Tinmaster/american-truck-simulator-cheat-trainer

## Resumen

`Tinmaster/american-truck-simulator-cheat-trainer` no es un modelo de inteligencia artificial: es un repositorio alojado en Hugging Face que distribuye un supuesto ejecutable para Windows (`lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe`, build `v4.1.2`) presentado como un "cheat trainer" para el videojuego American Truck Simulator. El paquete se ofrece como archivo ZIP de 4,8 MB protegido con la contraseña `2026` y se distribuye a través de enlaces externos a GitHub, no mediante los mecanismos habituales de pesos de modelos.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni código de inferencia. La model card describe módulos de overlay, radar, filtrado de objetos y un "escáner dinámico de offsets", además de instrucciones para ejecutar el binario como administrador. No hay pipeline declarado, cero descargas y cero likes en el momento de la consulta.

Desde la perspectiva de un desarrollador o investigador, este repositorio debe tratarse como un artefacto ajeno al ecosistema de modelos de IA. Su relevancia técnica es nula como modelo, pero es relevante como caso de estudio de riesgo: combina distribución de binarios opacos, contraseñas en archivos comprimidos, enlaces de descarga fuera de Hugging Face y ejecución con privilegios elevados, un patrón habitual en campañas de malware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe un ejecutable Win64 con módulos de overlay y escáner de offsets) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card, no capacidades del artefacto) |
| Licencia | MIT (declarada en metadatos; sin archivo LICENSE verificable en la información proporcionada) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe un supuesto "core externo en modo usuario" que operaría mediante Desktop Duplication sin inyección de DLL, un overlay externo a 144 Hz con cajas 2D/3D y esqueletos, un radar 2D con filtrado de objetos por rareza, un suavizado de entrada Bézier y un "escáner dinámico de offsets" para resolver firmas de punteros tras parches del juego. También menciona 13 y 14 hilos de trabajo y consumos de memoria inferiores a 32 MB y 53 MB según el módulo.

Estos datos provienen exclusivamente del texto de la model card y no son verificables. No se aporta información sobre dataset, tokens de entrenamiento, RLHF, DPO ni innovaciones en decodificación. El nombre del archivo (`lossless-scaling-3-dlss4-unlocked-2026`) no guarda relación con la funcionalidad descrita y parece un señuelo de SEO.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de la API de modelos.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los 14 idiomas listados son etiquetas de metadatos.
- No dispone de modo thinking, visión, audio ni multimodalidad.
- Las únicas "capacidades" declaradas son funciones de trampas para un videojuego: overlay, radar, filtrado de objetos, suavizado de entrada y descarga de módulos mediante tecla de pánico (`END`).

## Casos de uso

- Análisis de riesgo de cadena de suministro: inspeccionar el repositorio en un entorno aislado para documentar patrones de distribución maliciosa (ZIP con contraseña, enlaces a GitHub externos, ejecución como administrador) y alimentar reglas de detección en proxies y EDR.
- Formación en seguridad para desarrolladores: usar la model card como ejemplo didáctico de señales de alarma en repositorios de Hugging Face que no contienen modelos.
- Investigación de SEO y spam en plataformas de modelos: estudiar cómo se etiquetan artefactos ajenos con nombres de tecnologías populares (DLSS, Lossless Scaling) para posicionarse en búsquedas.
- Auditoría de políticas de plataforma: evaluar si el repositorio cumple las condiciones de uso de Hugging Face para distribución de software ejecutable.
- Pruebas de filtrado corporativo: verificar que los sistemas de clasificación de URLs y descargas bloquean el patrón de enlace de release de GitHub con contraseña embebida.
- Documentación de incidentes: registrar el identificador `Tinmaster/american-truck-simulator-cheat-trainer` como indicador de compromiso en bases de threat intelligence.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de inferencia, y al no ser un modelo de IA no procede comparación de rendimiento lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni inferencia neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado por el autor: Windows 10 (22H2) y Windows 11 (24H2), x64.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no pueden cargar este artefacto).
- Latencia y throughput: no disponibles; las cifras de la model card (144 Hz de overlay, 96,4 % y 96,8 % de "consistencia") no son verificables ni están definidas metodológicamente.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoría, se compara con otros tipos de repositorio de Hugging Face:

| Criterio | Este repositorio | Modelo de lenguaje típico | Repositorio de dataset típico |
|---|---|---|---|
| Contenido | ZIP con `.exe` para Windows | Pesos safetensors/GGUF | Archivos Parquet/JSONL |
| Pesos | No | Sí | No |
| Pipeline declarado | No disponible | text-generation, etc. | No aplica |
| Ejecución con privilegios | Sí (como administrador) | No | No |
| Verificabilidad | Baja (contraseña, enlaces externos) | Media-alta (hash, config) | Alta |
| Descargas / likes | 0 / 0 | Variable | Variable |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generación de texto, código o razonamiento queda fuera de lugar.
- Distribución de binario opaco: el ZIP contiene un `.exe` que la model card indica ejecutar como administrador, lo que otorga control total del sistema si el binario es malicioso.
- Contraseña embebida (`2026`) en el archivo comprimido: técnica habitual para evadir análisis automáticos de antivirus y sandboxes.
- Enlaces de descarga alojados en repositorios de GitHub de terceros (`Hiroshis198`, `Massimo262`), no en Hugging Face, lo que impide verificar integridad y procedencia.
- Inconsistencia entre el nombre del archivo (`lossless-scaling-3-dlss4-unlocked`) y la funcionalidad declarada (trainer para American Truck Simulator), indicio de señuelo SEO.
- Cero descargas y cero likes: sin evidencia de uso legítimo ni comunidad que valide el artefacto.
- Licencia MIT declarada solo en metadatos; no se aporta archivo de licencia ni titularidad verificable.
- Riesgo de alucinación: no aplica a un modelo, pero la model card contiene afirmaciones no verificables (porcentajes de consistencia, builds, tamaños) que no deben citarse como hechos.
- Uso comercial: la licencia MIT permitiría teóricamente su redistribución, pero hacerlo con un binario no auditado expone a responsabilidad legal y de seguridad.
- Recomendación operativa: no ejecutar el binario en sistemas de producción ni en máquinas con credenciales; si se analiza, hacerlo en una VM desechable sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tinmaster/american-truck-simulator-cheat-trainer
- Enlace de descarga citado en la model card (GitHub, `Hiroshis198`): https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026/releases/download/v1.2.0/lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card (GitHub, `Massimo262`): https://github.com/Massimo262/american-truck-simulator-cheat-trainer/releases/latest
- Paper: no disponible
- Blog o demo oficial: no disponible
- Repositorio de código asociado: no disponible
