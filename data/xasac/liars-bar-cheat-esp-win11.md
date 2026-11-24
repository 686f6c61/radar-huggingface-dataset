# xasac/liars-bar-cheat-esp-win11

## Resumen

El repositorio `xasac/liars-bar-cheat-esp-win11` no contiene un modelo de inteligencia artificial. Se trata de un paquete alojado en Hugging Face cuyo contenido declarado es un ejecutable y un archivo ZIP para Windows x64, presentados por el autor como una herramienta de trampas (ESP, radar 2D, overlay) para el videojuego Liars Bar. No existe arquitectura neuronal, pesos, tokenizador ni pipeline de inferencia asociado.

La model card describe un binario denominado `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe` empaquetado en un ZIP de 4,8 MB protegido con contraseña, con instrucciones para ejecutarlo como administrador y desactivar advertencias de Windows Defender o SmartScreen. Los enlaces de descarga apuntan a repositorios de GitHub de terceros, no al propio repositorio de Hugging Face, y la nomenclatura mezcla el nombre de otro juego (Kingdom Come: Deliverance 2) con el de Liars Bar.

Desde la perspectiva de un editor técnico de IA open source, este artefacto no es evaluable como modelo: no hay parámetros, contexto, licencia de pesos ni benchmarks. Además, el patrón (binario ofuscado, contraseña en el archivo, petición explícita de excluirlo del antivirus, enlaces a repositorios ajenos) coincide con las técnicas habituales de distribución de malware. Se documenta aquí únicamente para dejar constancia de que no constituye un modelo y para advertir de los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete binario para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (metadatos de la model card, no capacidades del artefacto) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el paquete declarado es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No aplica. No se describe ninguna arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste (RLHF, DPO, SFT) ni innovación técnica de modelado. La model card se limita a enumerar supuestos módulos de un programa de trampas: escáner dinámico de offsets, radar 2D con filtro de loot, perfiles JSON intercambiables en caliente, capa de renderizado excluida de capturas (OBS, ShadowPlay, Discord), overlay externo a 144 Hz y tecla de pánico (`END`) para descarga del proceso.

Tampoco hay información verificable sobre el binario: no se indica compilador, dependencias, firma de código ni hash de integridad. El tamaño declarado del ZIP (4,8 MB) y la contraseña fija (`2026`) son los únicos datos concretos, y ninguno de ellos es un parámetro de modelo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma de los metadatos son etiquetas de descubrimiento, no funcionalidad.
- El artefacto declarado ejecuta, según el autor, funciones de overlay y radar sobre un proceso de juego en Windows x64.

## Casos de uso

- Ninguno legítimo en el ámbito de IA open source: el repositorio no contiene pesos ni código de inferencia que pueda integrarse en un pipeline de ML.
- Evaluación de modelos: no aplica, al no existir modelo que medir con MMLU, HumanEval, GSM8K ni similares.
- Despliegue en producción: no aplica; ejecutar binarios de procedencia no verificada como administrador es un riesgo de seguridad, no un caso de uso.
- Investigación en seguridad: el paquete podría analizarse en un entorno aislado (sandbox, máquina virtual sin red) como muestra de malware potencial, nunca en un equipo de trabajo.
- Moderación de contenido: el repositorio sirve como ejemplo de patrón de spam y de distribución sospechosa en plataformas de modelos, útil para calibrar filtros de moderación.
- Documentación y trazabilidad: registrar la existencia del artefacto para que otros desarrolladores no lo confundan con un modelo real al buscar en el Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (99 % de valoración, 650 K descargas, 26 ms de respuesta, 177 Hz de sondeo) son afirmaciones de marketing del autor sin metodología, sin fuente y sin verificación independiente; no son benchmarks de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 u 11 de 64 bits; el autor indica ejecución como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras citadas por el autor no son verificables.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable: el artefacto no es un modelo de IA, por lo que no procede compararlo con LLM, modelos de visión ni modelos multimodales.

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse ni evaluarse como tal en comparativas de modelos.
- Riesgo de seguridad alto: binario sin firma, protegido con contraseña fija, con instrucciones para desactivar Windows Defender y SmartScreen y ejecutarlo como administrador. Este patrón es habitual en la distribución de troyanos y stealers.
- Enlaces de descarga ajenos al repositorio: los botones apuntan a repositorios de GitHub de terceros, lo que impide verificar la integridad del archivo descargado.
- Inconsistencia de nomenclatura: el ejecutable hace referencia a otro juego (Kingdom Come: Deliverance 2) distinto del anunciado (Liars Bar), señal de plantilla reutilizada.
- Riesgo legal y de términos de servicio: las herramientas de trampa para videojuegos suelen violar los términos de uso de las plataformas y pueden conllevar el baneo de cuentas.
- Licencia MIT declarada en los metadatos, pero sin archivo de licencia verificable en el contenido descrito; no cubre responsabilidades sobre el binario distribuido.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce aún más la fiabilidad de cualquier afirmación de la model card.
- Recomendación: no descargar ni ejecutar; si se necesita analizar, hacerlo en una máquina virtual aislada y sin credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xasac/liars-bar-cheat-esp-win11
- Repositorio de GitHub citado en la model card: https://github.com/burke45/liars-bar-cheat-esp-win11
- Releases citadas en la model card: https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Paper, blog o demo: no disponible
