# Youzzevic/doors-gamemode-creator-script

## Resumen

"doors-gamemode-creator-script" es un repositorio alojado en Hugging Face bajo el identificador `Youzzevic/doors-gamemode-creator-script`. Pese a su ubicación en la plataforma, no se trata de un modelo de inteligencia artificial: la model card describe un ejecutable portable para Windows de 64 bits (`doors-gamemode-creator-script-v1.2.0-win64.exe`, build `v1.6.3`/`46A836`) distribuido en un archivo ZIP de 8,9 MB protegido con contraseña, presuntamente orientado a la creación de scripts para el modo de juego "Doors" de Roblox.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni artefactos propios de un modelo de lenguaje. No se declara pipeline, no hay parámetros, no hay longitud de contexto y no se publican resultados de evaluación. La información disponible se limita a metadatos de licencia (MIT), una lista de idiomas declarados y una descripción funcional de módulos de automatización (teleport, anti-AFK, ESP, webhooks de Discord, etc.).

Por tanto, esta ficha se redacta como evaluación técnica del artefacto tal como está documentado, señalando de forma explícita qué datos no están disponibles y las advertencias de seguridad pertinentes. No debe interpretarse como una ficha de modelo fundacional ni como recomendación de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un `.exe` y un `.zip`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura de red neuronal, datos de entrenamiento, número de tokens, composición del corpus ni procesos de alineación (RLHF, DPO u otros). El artefacto descrito en la model card es un binario ejecutable para Windows de 64 bits empaquetado en un ZIP de 8,9 MB, lo que descarta por tamaño la presencia de pesos de un modelo de lenguaje de cualquier escala relevante.

La documentación menciona módulos funcionales con métricas de latencia y consumo de memoria (por ejemplo, teleport con respuesta inferior a 18 ms, guardia anti-AFK con menos de 35 MB de RAM, optimizador de framerate con menos de 9 ms, ESP con menos de 4 ms y alertas por webhook con una consistencia declarada del 98,2 %). Estas cifras provienen exclusivamente de la model card y no son verificables ni se acompañan de metodología de medición.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión propias de un modelo de lenguaje.
- La model card enumera funcionalidades de automatización sobre un cliente de juego: teleport por coordenadas, guardia anti-AFK, cambio automático de servidor, optimización de framerate, ESP de entidades y cofres, y notificaciones mediante webhook de Discord.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: la metadata declara 14 idiomas, pero no se especifica si corresponden a interfaz, documentación o procesamiento de lenguaje natural.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Evaluación de seguridad de artefactos descargados: analizar el binario en un entorno aislado (sandbox, máquina virtual sin red) para determinar su comportamiento real antes de cualquier consideración de uso.
- Investigación sobre distribución de software potencialmente no deseado: estudiar los patrones de empaquetado (ZIP con contraseña, ejecutable que requiere privilegios de administrador, instrucciones para desactivar alertas del sistema) como caso de estudio de ingeniería social.
- Docencia en ciberseguridad: usar la model card como ejemplo de señales de alarma en repositorios de Hugging Face que no contienen modelos, útil en formación sobre verificación de procedencia de artefactos.
- Auditoría de cumplimiento de licencias: revisar la declaración MIT y contrastarla con la ausencia de código fuente publicable, para ilustrar los límites de una licencia aplicada a un binario opaco.
- Catalogación y moderación de repositorios: alimentar pipelines de clasificación que detecten artefactos no-ML alojados en plataformas de modelos, con el objetivo de mejorar el etiquetado y la cuarentena.
- Análisis de términos de servicio de plataformas de juego: documentar cómo este tipo de herramientas entra en conflicto con las políticas de Roblox y con las condiciones de uso de Hugging Face, como material para políticas internas de organizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas presentes en la model card (latencias en milisegundos, consumo de RAM y porcentaje de consistencia) carecen de metodología, entorno de prueba y reproducibilidad, por lo que no se recogen como resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no es un modelo de lenguaje.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Almacenamiento: el paquete ZIP ocupa 8,9 MB según la model card.
- Memoria RAM declarada por módulo: menos de 35 MB (anti-AFK) y menos de 33 MB (server hopper), cifras no verificadas.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: solo cifras declaradas por el autor, sin validación independiente.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en la categoría de modelos de lenguaje porque el artefacto no es un modelo. Respecto a otras herramientas de automatización para Roblox, no se ha proporcionado información suficiente para establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, arquitectura ni tokenizador. Cualquier expectativa de inferencia es infundada.
- Distribución mediante ZIP protegido con contraseña y ejecutable que solicita ejecución como administrador: patrón habitual en campañas de malware y en software potencialmente no deseado.
- La model card incluye instrucciones para desactivar o ignorar alertas de Windows Defender y SmartScreen, lo que impide las protecciones del sistema operativo.
- No hay código fuente auditable pese a la licencia MIT, lo que limita la verificación de comportamiento y la reutilización legítima.
- El uso de automatizaciones en juegos en línea puede vulnerar los términos de servicio de la plataforma (Roblox) y acarrear el bloqueo de cuentas.
- Riesgo de alucinación: no aplica al no ser un modelo generativo; el riesgo equivalente es la documentación engañosa, con afirmaciones no verificables (688K descargas, valoración 5.0/5, build concreto) sin evidencia.
- Sesgos conocidos: no disponible.
- Restricciones de licencia para uso comercial: la licencia declarada es MIT, pero al no existir código fuente ni artefacto verificable, su aplicabilidad práctica es cuestionable.
- Recomendación operativa: no ejecutar el binario en sistemas de producción ni en máquinas con credenciales; si se analiza, hacerlo en un entorno aislado y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Youzzevic/doors-gamemode-creator-script
- Repositorio de GitHub referenciado en la model card: https://github.com/hoangn4795/doors-gamemode-creator-script
- Releases del repositorio de GitHub: https://github.com/hoangn4795/doors-gamemode-creator-script/releases/latest
- Paquete directo citado en la model card: https://github.com/hoangn4795/doors-gamemode-creator-script/releases/latest/download/doors-gamemode-creator-script-v1.2.0-win64.zip
