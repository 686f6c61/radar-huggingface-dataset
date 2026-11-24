# Yamannouri/beamng-drive-cheat-trainer

## Resumen

El repositorio `Yamannouri/beamng-drive-cheat-trainer` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows x64 etiquetado como "cheat trainer" para el videojuego BeamNG.drive, publicado en Hugging Face bajo licencia MIT y con cero descargas y cero "likes" en el momento de la consulta. La model card describe un ejecutable portable (`schedule-1-cheat-trainer-v1.2.2-win64.exe`, build v2.0.8) empaquetado en un ZIP de 4,8 MB protegido con contraseña, junto con enlaces a repositorios de GitHub de terceros.

No existe información sobre arquitectura de red neuronal, parámetros, tokenizador, corpus de entrenamiento ni pesos en formato safetensors o GGUF. Los "tags" del repositorio (windows, portable, cheat-trainer, region:us) y el contenido del README confirman que la publicación es un artefacto binario de software, no un modelo lingüístico. Por tanto, esta ficha documenta el artefacto tal como aparece publicado y advierte de que no es evaluable como modelo de IA.

Es relevante ahora porque ilustra un patrón de abuso de Hugging Face como plataforma de distribución de binarios ejecutables ajenos al ecosistema de modelos, con técnicas de ingeniería social (contraseñas en el archivo, instrucciones para desactivar SmartScreen, enlaces a repositorios de GitHub no verificados) que los equipos de seguridad deberían conocer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no verificable en un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |
| Tamano del paquete | 4,8 MB (según la model card) |
| Version declarada | v2.0.8 (build B5C143) |
| Plataforma | Windows 11 / Windows x64 |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-11-24 |
| Fecha de actualizacion | 2026-11-24 |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir. La model card no menciona transformer, MoE, SSM ni ningún otro diseño de modelo; tampoco hace referencia a tokens de entrenamiento, composición de dataset, RLHF, DPO ni proceso de alineamiento alguno. El contenido técnico del README se limita a describir supuestas funcionalidades del ejecutable: perfiles JSON con cambio en caliente, una capa de render "stream-proof" para evadir capturas de OBS/ShadowPlay/Discord, overlay externo a 144 Hz, escáner dinámico de offsets, núcleo en modo usuario sin hooks DLL y suavizado de entrada Bézier.

Estas descripciones corresponden a técnicas habituales en software de trampas para videojuegos (evasión de captura, lectura de memoria de otro proceso, overlays externos), no a componentes de un modelo de lenguaje. No se aporta ningún dato verificable sobre el binario: ni hash, ni firma, ni repositorio de código fuente, ni proceso de build reproducible.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No dispone de modo "thinking", visión, audio ni capacidades multimodales.
- El README atribuye al ejecutable funciones de overlay externo, perfiles de configuración y evasión de captura de pantalla, sin evidencia verificable.
- Los 14 idiomas listados en los metadatos son etiquetas del repositorio, no capacidades lingüísticas demostradas.

## Casos de uso

- No aplica como modelo de IA en ningún pipeline de generación de texto, código, visión o agentes.
- Auditoría de seguridad: analizar en un entorno aislado (sandbox, máquina virtual sin red) el binario distribuido para determinar su comportamiento real antes de cualquier uso.
- Estudio de patrones de abuso de plataformas: documentar cómo se emplean model cards y etiquetas de Hugging Face para distribuir ejecutables con instrucciones de desactivación de protecciones del sistema.
- Formación en concienciación: usar el caso como ejemplo de ingeniería social (contraseña "2026" en el ZIP, enlaces a repositorios de GitHub de terceros, insignias de descargas y valoraciones no verificables).
- Investigación de malware: comparar las técnicas declaradas (evasión de captura, escaneo de offsets, ejecución como administrador) con familias conocidas de software no deseado.
- Denuncia y retirada de contenido: reportar el repositorio a Hugging Face si se confirma que infringe las políticas de la plataforma sobre distribución de binarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README incluye cifras de marketing no verificables (411 Hz de sondeo, menos de 10 ms de respuesta, 99,7 % de consistencia, 434K descargas), pero no son métricas de modelo ni van acompañadas de metodología reproducible.

## Requisitos de hardware

- No aplica VRAM para inferencia de un modelo de IA: no hay pesos que cargar.
- Requisitos declarados: Windows x64 (Windows 11 incluido), ejecución como administrador.
- No cabe en GPU ni en CPU en el sentido de un LLM; es un ejecutable de escritorio.
- Opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI: no aplican.
- Latencia y throughput: no disponibles; las cifras del README no son verificables.

## Comparativa con modelos similares

| Criterio | Este repositorio | Modelo de lenguaje open source típico | Otro artefacto binario en Hugging Face |
|---|---|---|---|
| Naturaleza | Ejecutable Windows (ZIP + .exe) | Pesos en safetensors/GGUF | Ejecutable o script |
| Parámetros | no disponible | Millones a cientos de miles de millones | no disponible |
| Contexto | no disponible | 4K a 1M tokens | no disponible |
| Licencia | MIT | Apache 2.0, MIT, Llama, etc. | Variable |
| Evaluable con benchmarks | No | Sí | No |
| Riesgo para el usuario | Alto (binario no verificado, instrucciones para desactivar SmartScreen) | Bajo si se usa con sandbox | Alto |

No se identifican modelos comparables en la misma categoría porque la categoría no es la de modelos de IA.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como LLM carece de sentido y los resultados serían inválidos.
- El binario se distribuye sin hash, sin firma de código y sin código fuente, por lo que su contenido no es auditable.
- El README pide explícitamente desactivar o ignorar Windows Defender y SmartScreen, práctica característica de software malicioso o no deseado.
- El ZIP está protegido con contraseña ("2026"), técnica que dificulta el análisis automático por parte de antivirus y escáneres de correo.
- Los enlaces apuntan a repositorios de GitHub de terceros (`arjunzimmermann624`, `DominiqueMorales60`) distintos del titular del repositorio en Hugging Face, lo que rompe la cadena de confianza.
- Uso comercial: la licencia MIT permitiría teóricamente su redistribución, pero el uso del software puede infringir los términos de servicio de BeamNG.drive y la legislación sobre trampas en juegos en algunas jurisdicciones.
- Riesgo de alucinación: no aplica; el riesgo real es la ejecución de código no verificado con privilegios de administrador.
- No se debe descargar ni ejecutar en equipos de producción ni en máquinas con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Yamannouri/beamng-drive-cheat-trainer
- Repositorio de GitHub citado en el README (no verificado): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer
- Releases citadas en el README (no verificadas): https://github.com/DominiqueMorales60/beamng-drive-cheat-trainer/releases/latest
- Paper, blog o demo oficial: no disponible
