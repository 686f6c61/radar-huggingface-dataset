# VanyaJ/bada-terminal

## Resumen

BADA Terminal × Bong v2.1.0 es un paquete de distribución para Windows x64 que empaqueta una aplicación de escritorio y un runtime de agente de IA, no un modelo de lenguaje en el sentido habitual. El repositorio de Hugging Face, publicado por el usuario VanyaJ bajo licencia MIT, contiene exclusivamente binarios de instalación (un instalador NSIS y un ZIP portable) de aproximadamente 0,5 GB. La model card está redactada en coreano y describe la aplicación como un "wrapper de escritorio" con un "runtime cognitivo" denominado Bong.

El artefacto integra una arquitectura que el autor denomina "7대 토큰 다이어트 아키텍처" (arquitectura de dieta de tokens de siete componentes), que incluye módulos como Ponytail, Caveman, RTK, Headroom SmartCrusher, Context Mode con FTS5/BM25, búsqueda de símbolos Serena y un auditor Token Optimizer. También incorpora un puente de memoria L1/L2 (Mories) con cifrado AES-256-GCM en disco, un sandbox local multiplataforma con almacenamiento de objetos remoto (S3, Cloudflare R2, MinIO) y orquestación multiagente (BADA Herd) con un broker NATS embebido.

Es relevante ahora únicamente como artefacto de distribución de software: no se publican pesos, arquitectura de red neuronal, datos de entrenamiento ni benchmarks. Cualquier evaluación como modelo de IA es, por tanto, imposible con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene una aplicación Electron, no un modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la documentación está en coreano; la interfaz no especifica idiomas) |
| Licencia | MIT |
| Formato de pesos | no disponible (los artefactos son `.exe` NSIS y `.zip` portable para Windows x64) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal ni proceso de entrenamiento en la información proporcionada. El paquete es una aplicación de escritorio construida sobre Electron (según los tags del repositorio) que se distribuye para Windows x64, con un instalador NSIS que incluye `node-setup.msi` para entornos sin Node.js y una versión portable en ZIP. El tamaño del repositorio (0,5 GB) es coherente con un bundle de aplicación empaquetada, no con pesos de modelo.

Las innovaciones que menciona la model card son de ingeniería de software, no de aprendizaje automático: una "arquitectura de dieta de tokens" con siete componentes (Ponytail, Caveman, RTK, Headroom SmartCrusher + CCR, Context Mode FTS5/BM25, búsqueda de símbolos Serena y auditor Token Optimizer), un puente de memoria L1/L2 con cifrado AES-256-GCM y permisos `0o600`, un sandbox local con almacenamiento de objetos remoto (S3, Cloudflare R2, MinIO) y orquestación multiagente con broker NATS v2.10.22 embebido (`nats-server.exe`). No se especifica qué modelo subyacente consume el runtime, si lo hay.

## Capacidades

- Distribución de una aplicación de escritorio para Windows x64 en dos formatos: instalador NSIS con autoinstalación de Node.js y ZIP portable.
- Runtime de agente de IA con ventana/dock de escritorio y runtime web (`artifacts/bong-app.html`, ruta `/bong`).
- Optimización de contexto mediante los siete módulos citados (compresión de tokens, modo contexto con FTS5/BM25, búsqueda de símbolos).
- Memoria persistente L1/L2 con outbox offline y cifrado en disco AES-256-GCM.
- Sandbox local y espacio de trabajo virtual sobre almacenamiento S3, Cloudflare R2 o MinIO.
- Orquestación multiagente (BADA Herd) con broker NATS distribuido embebido.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni multilingüismo del propio artefacto.

## Casos de uso

- Despliegue de un entorno de agente de escritorio en estaciones Windows: el instalador NSIS permite distribuir la aplicación en parques corporativos sin requerir Node.js preinstalado, gracias al `node-setup.msi` embebido.
- Ejecución portable en máquinas restringidas: el ZIP permite ejecutar `BADA Terminal.exe` sin instalación, útil para auditorías o entornos sin permisos de administrador.
- Orquestación de múltiples agentes en local: el broker NATS embebido y BADA Herd permiten montar topologías multiagente sin infraestructura externa.
- Persistencia cifrada de memoria de agente: el puente Mories con AES-256-GCM y permisos `0o600` es adecuado para conservar historial sensible en disco de forma controlada.
- Trabajo con repositorios de contexto extenso: los módulos de compresión de tokens y el modo contexto FTS5/BM25 buscan reducir el coste de contexto en sesiones largas.
- Integración con almacenamiento de objetos: el espacio de trabajo virtual sobre S3, R2 o MinIO permite sincronizar artefactos generados por el agente con backend remoto.
- Exploración de código asistida: el módulo Serena de búsqueda de símbolos puede emplearse para navegar bases de código grandes dentro del entorno de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no contiene pesos de modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Sistema operativo: Windows x64 (único objetivo declarado en la model card).
- Requisito de runtime: Node.js, instalado automáticamente por el instalador NSIS si no está presente.
- Opciones de despliegue: instalador NSIS (`BADA Terminal Setup 2.1.0.exe`) o ZIP portable (`BADA Terminal-2.1.0-win.zip`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque el artefacto no es un modelo de lenguaje sino un paquete de aplicación de escritorio; la comparación con LLMs u otros modelos open source no es pertinente con la información disponible.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo ni documentación de arquitectura neuronal; no debe tratarse como un modelo evaluable.
- La model card está íntegramente en coreano y no documenta idiomas de interfaz ni de procesamiento.
- El artefacto se distribuye únicamente para Windows x64; no hay builds para Linux ni macOS.
- El instalador incluye un `node-setup.msi` embebido que instala software adicional en el sistema; conviene revisar el binario antes de desplegarlo en producción.
- No se especifica qué modelo de lenguaje subyace al runtime ni sus condiciones de uso, lo que impide evaluar riesgos de sesgo, alucinación o cumplimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción ni mantenimiento comunitario.
- La licencia MIT cubre el paquete, pero no aclara la licencia de los componentes de terceros incluidos (NATS, Node.js, Electron).
- No hay información sobre telemetría, tratamiento de datos ni cumplimiento de RGPD.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VanyaJ/bada-terminal
- Instalador NSIS: https://huggingface.co/VanyaJ/bada-terminal/resolve/main/BADA%20Terminal%20Setup%202.1.0.exe
- ZIP portable: https://huggingface.co/VanyaJ/bada-terminal/resolve/main/BADA%20Terminal-2.1.0-win.zip
