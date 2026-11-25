# Stellarquia/wax-asmr-tower-script

## Resumen

El artefacto publicado bajo el identificador `Stellarquia/wax-asmr-tower-script` en Hugging Face no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 distribuido como archivo ZIP (`schedule-1-cheat-trainer-v1.2.2-win64.zip`, 4,8 MB) que, según su propia model card, contiene un binario (`schedule-1-cheat-trainer-v1.2.2-win64.exe`, build v2.9.9) descrito por el autor como una herramienta de tipo *game cheat* o *trainer*. No existe arquitectura neuronal, pesos, tokenizador ni pipeline de inferencia asociado.

La relevancia de esta ficha es, por tanto, documental y de advertencia: el repositorio aparece indexado en Hugging Face con etiquetas que simulan ser un modelo multilingüe (14 idiomas declarados) y una licencia MIT, pero el contenido real es un ejecutable de terceros alojado en GitHub, protegido con contraseña de archivo y que solicita ejecución como administrador. No se dispone de información técnica verificable sobre su funcionamiento interno, ni de benchmarks, ni de arquitectura.

Desde la perspectiva de evaluación de modelos, este artefacto debe clasificarse como no apto para cualquier uso relacionado con IA. Cualquier integración en pipelines de desarrollo, investigación o producción queda fuera de su naturaleza y de las garantías habituales de un modelo open source.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, sin verificación funcional) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el paquete es un ZIP con un `.exe`; no hay safetensors, GGUF ni ningún formato de pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un ejecutable empaquetado en un ZIP de 4,8 MB con contraseña de extracción (`2026`), que según la model card implementa funciones descritas como escáner dinámico de offsets, suavizado de entrada Bézier, núcleo externo en modo usuario, capa de render *stream-proof* para exclusión de capturas (OBS, ShadowPlay, Discord), tecla de pánico (`END`) y radar 2D con filtro de loot. Estas descripciones provienen exclusivamente del texto del autor y no han sido verificadas ni son auditables desde el repositorio.

No se documenta composición de dataset, número de tokens, RLHF, DPO ni ninguna innovación técnica de aprendizaje automático. El binario se distribuye a través de enlaces de GitHub Releases de terceros (`arjunzimmermann624/schedule-1-cheat-trainer` y `oScott85/wax-asmr-tower-script`), no desde el propio repositorio de Hugging Face.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta *tool calling* ni *function calling*.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales pese a los 14 códigos de idioma en los metadatos.
- No dispone de modo *thinking*, visión, audio ni ninguna modalidad de IA.
- Las únicas funciones descritas por el autor son de manipulación de memoria de procesos de terceros en Windows (offsets, radar, filtro de loot, suavizado de entrada), sin documentación técnica verificable.

## Casos de uso

- Ninguno relacionado con IA generativa, procesamiento de lenguaje, visión por computador o agentes.
- Auditoría de seguridad: analizar el binario en un entorno aislado (sandbox, máquina virtual sin red) para determinar su comportamiento real antes de cualquier otra consideración.
- Documentación de riesgos en cadena de suministro: registrar el patrón de repositorios de Hugging Face que alojan ejecutables con contraseña y enlaces externos como ejemplo de artefacto no confiable.
- Investigación sobre *game cheats*: estudio académico de técnicas de evasión descritas (exclusión de captura, *stream-proof*), siempre sobre el texto declarativo y sin ejecución.
- Formación en higiene de seguridad: caso práctico de por qué no deben ejecutarse binarios descargados de repositorios de modelos con permisos de administrador.
- Moderación de plataformas: identificar metadatos engañosos (tags de idioma, licencia MIT) que simulan ser un modelo para mejorar su indexación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente declara cifras internas no verificables (tiempos de respuesta de 27 ms y 31 ms, sondeo a 391 Hz y 261 Hz, siete hilos de trabajo), que no constituyen benchmarks de un modelo de IA ni son comparables con MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que inferir).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 22H2 y Windows 11 24H2, x64 (Intel y AMD).
- Espacio en disco: 4,8 MB para el ZIP; el tamaño descomprimido no está documentado.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables ni relevantes para IA.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable: el artefacto no es un modelo de IA y no puede contrastarse con LLM, modelos de visión ni sistemas multimodales en parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, integrarse ni desplegarse como tal.
- Ejecutable de origen no verificado distribuido vía GitHub Releases de terceros, no desde el repositorio de Hugging Face.
- Solicita ejecución como administrador y extracción con contraseña, patrón habitual en campañas de malware y en herramientas que evaden el análisis.
- Los metadatos (14 idiomas, licencia MIT, tags de modelo) no reflejan la naturaleza real del artefacto y pueden inducir a error en búsquedas automatizadas.
- Riesgo elevado de seguridad: el propio autor reconoce que Windows Defender y SmartScreen generan alertas y recomienda añadir exclusiones, lo que desactiva protecciones del sistema.
- Uso descrito como *game cheat*: puede violar los términos de servicio de juegos y acarrear consecuencias legales o de cuenta según la jurisdicción.
- Sin auditoría, sin código fuente, sin reproducibilidad y sin garantías de ningún tipo más allá de la licencia MIT declarada.
- No debe ejecutarse en máquinas con datos sensibles, credenciales o acceso a red corporativa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Stellarquia/wax-asmr-tower-script
- Release enlazada por el autor (GitHub): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Repositorio GitHub alternativo enlazado: https://github.com/oScott85/wax-asmr-tower-script/releases/latest
- Paper, blog, demo o documentación técnica adicional: no disponible
