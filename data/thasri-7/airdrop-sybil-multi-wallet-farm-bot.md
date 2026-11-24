# thasri-7/airdrop-sybil-multi-wallet-farm-bot

## Resumen

El repositorio `thasri-7/airdrop-sybil-multi-wallet-farm-bot` alojado en Hugging Face no contiene un modelo de inteligencia artificial en el sentido convencional. Se trata de un paquete ejecutable para Windows 10/11 de 64 bits, distribuido como archivo ZIP de 8,9 MB con contraseña de extracción, que la model card describe como una herramienta de automatización de granjas de wallets para airdrops y operaciones sybil. No se publica ningún peso neuronal, tokenizador, configuración de arquitectura ni pipeline de inferencia.

La ficha del autor incluye etiquetas propias de un binario (`windows`, `windows-11`, `x64`, `portable`) junto con una lista de idiomas declarados (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) que no se corresponde con capacidades lingüísticas de un modelo, sino con la presunta interfaz del ejecutable. El repositorio registra cero descargas y cero "likes" en el momento de la consulta, y fue creado y actualizado el 24 de noviembre de 2026 con un segundo de diferencia, lo que sugiere una publicación automatizada.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado, señalando explícitamente qué datos no están disponibles y qué riesgos de seguridad presenta su instalación. No debe interpretarse como una evaluación de un modelo de lenguaje, visión o multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del autor; sin verificación) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un `.zip` con un `.exe` interno) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. El artefacto es un binario compilado para Windows (`airdrop-sybil-multi-wallet-farm-bot-v1.2.0-win64.exe`, build `v2.2.8 (BF7790)`) empaquetado en un ZIP de 8,9 MB protegido con la contraseña `2026`. La model card menciona componentes propios de software de automatización y evasión: "user-mode external core", "dynamic offset scanner", "bezier input smoothing", "stream-proof render layer" con exclusión de captura en OBS, ShadowPlay y Discord, y una "panic key" mapeada a la tecla `END` para terminar el proceso. Estos términos son habituales en herramientas de trampas para videojuegos y en utilidades de automatización de cuentas, no en modelos de IA.

No se documenta ningún proceso de entrenamiento, dataset, número de tokens, RLHF, DPO ni innovación algorítmica. La ausencia de pesos, de configuración `config.json` y de tokenizador confirma que no hay modelo subyacente publicable.

## Capacidades

- No se puede confirmar ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio: no hay pesos ni pipeline declarado.
- La model card atribuye al ejecutable funciones de automatización multi-wallet, gestión de perfiles JSON con intercambio en caliente y escaneo dinámico de offsets; son afirmaciones del autor sin verificación independiente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: las etiquetas listan 14 idiomas, pero no hay evidencia de implementación ni de evaluación.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- No se identifican casos de uso legítimos para un modelo de IA, porque el artefacto no es un modelo. Los escenarios que la model card sugiere (automatización de granjas de wallets para airdrops, operaciones sybil) están orientados a manipular sistemas de distribución de tokens y suelen vulnerar los términos de servicio de las plataformas afectadas.
- Auditoría de seguridad defensiva: un analista podría extraer el binario en una máquina aislada y sin red para estudiar sus técnicas de evasión de captura y su comportamiento, con fines de detección.
- Análisis de malware: el patrón (ZIP con contraseña, ejecutable que requiere "Run as Administrator", enlaces a un repositorio de GitHub de terceros distinto del autor declarado) es coherente con campañas de distribución de software malicioso y puede servir como muestra de referencia en un laboratorio.
- Formación en concienciación: el propio repositorio puede usarse como ejemplo didáctico de señales de alarma en cadenas de suministro de software.
- No se recomienda su uso en producción, en entornos con acceso a wallets reales ni en máquinas con credenciales.
- Cualquier escenario de despliegue en infraestructura de IA (vLLM, TGI, llama.cpp) es inaplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados por el autor: Windows 10/11 de 64 bits, extracción completa del ZIP antes de ejecutar y lanzamiento como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles ni aplicables.
- Latencia y throughput: no disponibles; la model card cita cifras internas del ejecutable (respuesta en menos de 21 ms, sondeo a 123 Hz, 14 y 9 hilos de trabajo) que no son verificables ni corresponden a inferencia de un modelo.

## Comparativa con modelos similares

| Criterio | Este artefacto | Modelo de lenguaje open source típico (p. ej. familia Llama o Mistral) | Herramienta de automatización legítima (p. ej. scripts de trading) |
|---|---|---|---|
| Naturaleza | Ejecutable Windows empaquetado | Pesos neuronales en safetensors/GGUF | Código fuente auditable |
| Parámetros | no disponible | Miles de millones | no aplica |
| Contexto | no disponible | Decenas de miles de tokens | no aplica |
| Licencia | MIT (declarada) | Licencias abiertas variables | Variable |
| Verificabilidad | Nula: binario cerrado con contraseña | Alta: pesos y código públicos | Alta si es código abierto |
| Riesgo de seguridad | Alto: ejecutable sin firma ni trazabilidad | Bajo-medio | Bajo si se audita |

No se dispone de modelos comparables de la misma categoría porque la categoría declarada (bot de granjas de wallets) no corresponde a un modelo de IA.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador ni pipeline; cualquier expectativa de inferencia es infundada.
- Distribución mediante ZIP con contraseña y ejecutable que solicita privilegios de administrador: patrón habitual en la entrega de software malicioso.
- El enlace de descarga apunta a un repositorio de GitHub (`shepherdclaypit71/...`) distinto del autor declarado en Hugging Face (`thasri-7`), lo que rompe la cadena de confianza.
- La licencia MIT declarada no garantiza la ausencia de código dañino; el binario no es auditable.
- Riesgo elevado de robo de credenciales y claves privadas de wallets si se ejecuta en un equipo con acceso a fondos.
- Las afirmaciones de rendimiento (21 ms, 123 Hz, exclusión de captura) no están verificadas ni acompañadas de metodología.
- Uso comercial: la licencia MIT lo permitiría formalmente, pero el uso del artefacto puede infringir términos de servicio de plataformas de airdrops y normativa financiera.
- Sesgos y alucinación: no aplica al no ser un modelo generativo; el riesgo relevante es de seguridad, no de calidad de salida.
- No se recomienda su descarga, extracción ni ejecución en entornos productivos o personales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/thasri-7/airdrop-sybil-multi-wallet-farm-bot
- Repositorio de GitHub referenciado en la model card: https://github.com/shepherdclaypit71/airdrop-sybil-multi-wallet-farm-bot
- Releases del repositorio de GitHub: https://github.com/shepherdclaypit71/airdrop-sybil-multi-wallet-farm-bot/releases/latest
- Paper, blog o demo oficial: no disponible
