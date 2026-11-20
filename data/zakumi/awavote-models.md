# zakumi/awavote-models

## Resumen
AwaVote-models es un repositorio de modelos de reconocimiento automático del habla (ASR) convertidos a ONNX int8 para inferencia en el navegador mediante transformers.js. No es un modelo original: agrupa cuatro conversiones cuantizadas de los modelos ASR de N-ATLaS desarrollados por Awarri Technologies en colaboración con el Gobierno Federal de Nigeria, correspondientes a yoruba, hausa, igbo e inglés con acento nigeriano. El repositorio lo publica el usuario zakumi como artefacto del proyecto AwaVote, una aplicación de transparencia electoral construida para el hackathon KTech Fest 3.0.

Cada carpeta contiene un fine-tune de Whisper-small exportado a ONNX y cuantizado a int8, con la ventana del encoder acortada para acomodar comandos de voz breves. El objetivo es ejecutar ASR multilingüe nigeriano de forma totalmente offline en el dispositivo, sin depender de servicios en la nube, algo relevante en entornos con conectividad limitada o donde la privacidad del audio es crítica.

El repositorio tiene 1,1 GB, cero descargas y cero likes en el momento de la consulta, y la licencia es la N-ATLaS Open-Source Research and Innovation License, que impone límites al número de usuarios activos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small fine-tune, exportado a ONNX) |
| Parámetros totales | no disponible (Whisper-small: aproximadamente 244 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana del encoder acortada para comandos de voz breves) |
| Tipos de cuantización | int8 (ONNX) |
| Idiomas soportados | yoruba (yo), hausa (ha), igbo (ig), inglés nigeriano (en) |
| Licencia | N-ATLaS Open-Source Research and Innovation License (other) |
| Formato de pesos | ONNX (int8), con `registry.json` que lista tamano y SHA-256 de cada fichero |

## Arquitectura y entrenamiento
Los modelos subyacentes son fine-tunes de Whisper-small sobre datos de habla en yoruba, hausa, igbo e inglés con acento nigeriano, desarrollados por Awarri Technologies con el Gobierno Federal de Nigeria. Whisper es un transformer encoder-decoder con atención completa entrenado originalmente para transcripción y traducción multilingüe; los fine-tunes adaptan el modelo a las lenguas y acentos objetivo.

La contribución de este repositorio es la conversión: exportación a ONNX y cuantización a int8 para reducir el peso y permitir ejecución en navegador vía transformers.js. Además, se acorta la ventana del encoder para optimizar la latencia en comandos de voz cortos, un compromiso que reduce el contexto de audio admisible. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en los modelos fuente.

## Capacidades
- Reconocimiento automático del habla (transcripción) en yoruba, hausa, igbo e inglés nigeriano.
- Ejecución en el dispositivo y en el navegador mediante transformers.js y ONNX Runtime Web, sin conexión a red.
- Inferencia offline, adecuada para entornos con conectividad limitada.
- Optimización para comandos de voz breves gracias a la ventana de encoder reducida.
- Multilingüe dentro del conjunto de cuatro lenguas/acentos cubiertos.
- No se documentan capacidades de tool calling, agentes, visión, audio distinto de ASR ni modo de razonamiento.

## Casos de uso
- Aplicaciones de transparencia electoral: transcripción de comandos o reportes de voz de ciudadanos en su lengua local dentro de la app AwaVote, funcionando offline en el móvil.
- Formularios por voz en campo: captura de datos en hausa, yoruba o igbo en zonas rurales sin cobertura, con procesamiento local del audio.
- Asistentes de voz embebidos en web: integración de dictado por voz en aplicaciones web progresivas sin backend de ASR, reduciendo costes y latencia.
- Privacidad de datos sensibles: transcripción de audio médico o legal en el propio dispositivo, evitando enviar grabaciones a servidores externos.
- Accesibilidad: subtitulado en tiempo real de contenido hablado en lenguas nigerianas para usuarios con discapacidad auditiva.
- Investigación lingüística de campo: recogida y transcripción de corpus orales en yoruba, hausa e igbo con herramientas ligeras ejecutables en portátiles modestos.
- Kioscos o terminales de atención ciudadana: reconocimiento de comandos de voz cortos en entornos con hardware limitado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Al tratarse de ONNX int8 de Whisper-small, el peso por modelo es reducido (el repositorio completo ocupa 1,1 GB para cuatro modelos); la VRAM/RAM necesaria es modesta y no se especifica cifra exacta.
- Ejecutable en CPU de móviles y portátiles mediante ONNX Runtime Web; no requiere GPU dedicada.
- Compatible con navegadores modernos vía transformers.js y WebAssembly/WebGPU según soporte del runtime.
- Para despliegue en servidor podría usarse ONNX Runtime, pero no se documentan opciones como vLLM, TGI o llama.cpp (no aplicables a ASR).
- Latencia y throughput no disponibles; la ventana de encoder acortada sugiere baja latencia en comandos breves.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| AwaVote-models (este) | Whisper-small (~244 M) | yo, ha, ig, en nigeriano | ONNX int8 | N-ATLaS License | ventana acortada |
| NCAIR1/Yoruba-ASR (fuente) | Whisper-small | yo | safetensors/transformers | N-ATLaS License | no disponible |
| Whisper-small original (OpenAI) | ~244 M | multilingüe (99 idiomas) | safetensors, ONNX | MIT | 30 s de audio |
| Whisper-large-v3 | ~1,55 B | multilingüe | safetensors, etc. | MIT | 30 s de audio |

Los modelos fuente de NCAIR1 son la referencia directa; Whisper-small y Whisper-large-v3 sirven como línea base de ASR multilingüe, aunque sin fine-tuning específico para lenguas nigerianas su rendimiento en yoruba, hausa e igbo sería inferior.

## Limitaciones y advertencias
- Licencia restrictiva: la N-ATLaS Open-Source Research and Innovation License impone límites al número de usuarios activos; verificar antes de uso comercial o a escala.
- Ventana de encoder acortada: pensada para comandos breves; grabaciones largas pueden truncarse o degradar la transcripción.
- Solo cubre cuatro lenguas/acentos; no es un modelo ASR general.
- Posibles sesgos derivados de los datos de entrenamiento de los fine-tunes originales, no documentados.
- Riesgo de errores de transcripción en audio con ruido, acentos no representados o vocabulario técnico.
- Repositorio con cero descargas y sin benchmarks publicados: madurez y validación externa limitadas.
- Es una conversión de terceros, no un modelo oficial de Awarri; la responsabilidad de calidad recae en el publicador.
- Cada carpeta incluye su `NOTICE.txt`; es obligatorio respetar los términos de la licencia de los modelos fuente.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/zakumi/awavote-models
- Modelo fuente yoruba: https://huggingface.co/NCAIR1/Yoruba-ASR
- Modelo fuente hausa: https://huggingface.co/NCAIR1/Hausa-ASR
- Modelo fuente igbo: https://huggingface.co/NCAIR1/Igbo-ASR
- Modelo fuente inglés nigeriano: https://huggingface.co/NCAIR1/NigerianAccentedEnglish
- Aplicación AwaVote: https://awavote.onrender.com
- Código del proyecto: https://github.com/ktechfest2/TEAM-11-3.0
- Licencia: https://huggingface.co/NCAIR1/Yoruba-ASR
