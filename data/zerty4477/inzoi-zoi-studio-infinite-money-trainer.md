# zerty4477/inzoi-zoi-studio-infinite-money-trainer

## Resumen

El repositorio `zerty4477/inzoi-zoi-studio-infinite-money-trainer` no contiene un modelo de inteligencia artificial. Se trata de un paquete de software para Windows x64 (presumiblemente un ejecutable o conjunto de archivos comprimidos) etiquetado como "trainer" o "cheat" para el videojuego *InZOI* (o su herramienta *Zoi Studio*), con funciones declaradas como dinero infinito, radar 2D, filtro de loot y suavizado de entrada. El autor lo publica bajo licencia MIT y lo etiqueta con 14 idiomas, pero no hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados.

La model card no describe ningún modelo de lenguaje: enumera módulos de un supuesto menú de trucos (`rob-run-cheat-mod-menu-v1.2.2-win64.exe`), instrucciones para extraer un ZIP protegido con contraseña y ejecutarlo como administrador, y respuestas a preguntas frecuentes sobre alertas de Windows Defender. No se indica arquitectura, número de parámetros, longitud de contexto ni datos de entrenamiento porque no existen en este artefacto.

Por tanto, esta ficha no puede evaluar capacidades de IA, rendimiento en benchmarks ni requisitos de hardware de inferencia. Lo relevante para desarrolladores e investigadores es la advertencia: el contenido tiene las características típicas de una distribución de malware disfrazada de cheat (binario independiente, contraseña en el archivo comprimido para evadir análisis, instrucciones para desactivar protecciones, enlaces a repositorios de GitHub de terceros ajenos al autor declarado). No debe ejecutarse en ningún sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete de software ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del autor; sin verificación) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto declarado es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No aplica. No hay arquitectura de red neuronal, ni corpus de entrenamiento, ni proceso de ajuste (RLHF, DPO, SFT) descrito. El artefacto es un binario de Windows (`rob-run-cheat-mod-menu-v1.2.2-win64.exe`, build `1EADF8`) que, según la model card, opera en modo usuario con lectura directa de memoria, escaneo dinámico de offsets, renderizado por Desktop Duplication y 12 hilos de trabajo. Estas afirmaciones no son verificables y no constituyen información sobre un modelo de IA.

## Capacidades

- No hay capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No hay soporte de tool calling ni function calling.
- No hay soporte de agentes ni razonamiento multi-paso.
- El autor declara funciones de "trainer" para un videojuego (dinero infinito, radar 2D, filtro de loot, suavizado de entrada tipo aim assist), sin evidencia técnica ni código fuente.
- Las etiquetas multilingües no implican capacidad lingüística del artefacto; son metadatos del repositorio.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que describe la model card son:

- Modificación de partidas del videojuego *InZOI* mediante un ejecutable externo: requeriría ejecutar un binario de procedencia no verificada con privilegios de administrador, con riesgo alto de compromiso del sistema.
- Automatización de entrada (suavizado tipo aim assist) en un juego: el propio autor lo presenta como "humanized target curves", lo que sugiere evasión de sistemas antitrampas.
- Inyección de perfiles JSON en caliente: funcionalidad declarada sin código ni documentación técnica verificable.
- Distribución mediante ZIP con contraseña: práctica habitual para dificultar el análisis automatizado por antivirus, no un caso de uso.
- Ejecución como administrador tras alertas de SmartScreen: instrucción que agrava el riesgo en lugar de mitigarlo.
- Ninguno de estos escenarios es recomendable en producción ni en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de ningún tipo; las cifras que aparecen en la model card (por ejemplo, "97,7 % de consistencia" o "96,6 % de consistencia") son afirmaciones de marketing sin metodología ni datos que las respalden.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, ejecución como administrador, menos de 20 MB de RAM en el módulo externo, paquete de 4,8 MB.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable, ya que el artefacto no es un modelo. Como referencia de contraste, un modelo de lenguaje pequeño real (por ejemplo, de 1 a 3 mil millones de parámetros en formato GGUF) requiere pesos de varios cientos de megabytes a varios gigabytes, una arquitectura transformer documentada y un pipeline de inferencia; nada de ello está presente aquí.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con los criterios habituales de parámetros, contexto, benchmarks o licencia de pesos.
- El paquete se distribuye como ZIP protegido con contraseña (`2026`) y un ejecutable que debe lanzarse como administrador: patrón clásico de evasión de análisis y de escalada de privilegios.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`cishii039/rob-run-cheat-mod-menu`, `AdrianVieira80315/...`) distintos del autor declarado en Hugging Face, lo que rompe la cadena de custodia del artefacto.
- La model card incluye instrucciones explícitas para ignorar alertas de Windows Defender y SmartScreen; hacerlo elimina la principal barrera de protección del sistema.
- El uso de "trainers" en juegos puede infringir los términos de servicio de la plataforma y, según la jurisdicción, la normativa de protección de software; la licencia MIT del repositorio no cubre el uso del binario frente a terceros.
- Riesgo elevado de robo de credenciales, instalación de persistencia maliciosa o inclusión en redes de bots si se ejecuta.
- No hay código fuente, hashes verificables ni firma digital del binario.
- Los idiomas declarados y las descargas (0 en Hugging Face) no aportan ninguna garantía de calidad ni de legitimidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zerty4477/inzoi-zoi-studio-infinite-money-trainer
- Enlace de descarga citado en la model card (repositorio de terceros, no verificado): https://github.com/cishii039/rob-run-cheat-mod-menu/releases/download/v1.2.0/rob-run-cheat-mod-menu-v1.2.2-win64.zip
- Repositorio de terceros citado como espejo: https://github.com/AdrianVieira80315/inzoi-zoi-studio-infinite-money-trainer/releases/latest
