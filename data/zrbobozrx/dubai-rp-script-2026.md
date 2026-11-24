# zrbobozrx/dubai-rp-script-2026

## Resumen

El repositorio `zrbobozrx/dubai-rp-script-2026` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows x64 etiquetado por su autor como "game cheat" (script de trampas para un juego de rol, presumiblemente vinculado a un servidor de rol de Dubai), empaquetado como un ejecutable `dubai-rp-script-2026-v1.2.0-win64.exe` dentro de un archivo ZIP de 8,9 MB protegido con la contraseña `2026`.

La model card describe funcionalidades propias de un software de trampas multijugador: superposición externa a 144 Hz o más con cajas delimitadoras 2D/3D y esqueletos de huesos, ESP de distancia, radar 2D con filtrado de botín, suavizado de entrada Bézier con curvas de apuntado "humanizadas" y una capa de render "stream-proof" que excluye la captura de OBS, ShadowPlay y Discord. Ninguna de estas características corresponde a un modelo de lenguaje, visión o audio.

Por tanto, esta ficha no puede documentar arquitectura, parámetros ni capacidades de IA: no existen. El contenido se limita a describir qué es realmente el artefacto, sus riesgos de seguridad y por qué no debe tratarse como un modelo open source. Se incluye por rigor y para advertir a desarrolladores e investigadores que puedan encontrarlo indexado junto a modelos legítimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio, no capacidades del modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un `.exe` dentro de un `.zip` de 8,9 MB) |

## Arquitectura y entrenamiento

No aplica. No hay arquitectura neuronal, corpus de entrenamiento, tokens procesados ni fases de RLHF o DPO. El artefacto es un binario Windows x64 (build declarada `v3.8.5 (8520AC)`) que, según su propia documentación, opera en modo usuario externo mediante Desktop Duplication API para capturar la pantalla sin inyectar DLL en el proceso del juego.

La model card menciona parámetros operativos del software (polling a 382 Hz, 16 hilos de trabajo, respuesta inferior a 13 ms, consistencia del 97,8 % en el suavizado de entrada), pero son métricas de un cheat, no de un modelo. No existe información verificable sobre el código fuente ni sobre qué hace realmente el binario al ejecutarse.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no escribe código ni procesa matemáticas.
- Superposición externa con cajas delimitadoras 2D/3D, esqueletos de huesos y ESP de distancia, según la documentación del autor.
- Radar 2D con filtrado de botín por rareza y seguimiento de contenedores.
- Suavizado de entrada Bézier con radio de FOV configurable y comprobación de visibilidad.
- Perfiles JSON con intercambio en caliente entre preajustes Legit, Visual y Custom.
- Capa de render que, según el autor, evita la captura por OBS, ShadowPlay y Discord.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües reales.

## Casos de uso

- Ninguno legítimo en el ámbito de la IA. El artefacto no sirve para generación de texto, atención al cliente, generación de código, análisis de documentos ni ninguna tarea de aprendizaje automático.
- Uso declarado por el autor: trampas en un juego de rol multijugador, lo que normalmente infringe los términos de servicio del juego y puede conllevar el baneo de la cuenta.
- Riesgo de seguridad: ejecutar un binario de procedencia desconocida, sin código fuente y con instrucciones para desactivar las alertas de Windows Defender y SmartScreen, es un vector clásico de malware, robo de credenciales o mineros.
- La contraseña fija `2026` en el ZIP no aporta ninguna garantía de integridad ni de autenticidad; solo dificulta el análisis automático por parte de los antivirus.
- No debe integrarse en pipelines de CI/CD, entornos de producción ni flujos de trabajo de investigación.
- Su presencia en Hugging Face con etiquetas de idiomas y licencia MIT puede inducir a error a herramientas de descubrimiento de modelos; conviene excluirlo de cualquier catálogo automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (382 Hz de polling, menos de 13 ms de respuesta, 97,8 % de consistencia, 16 hilos) son afirmaciones comerciales del autor sobre el software de trampas, no mediciones reproducibles de un modelo, y no se han verificado de forma independiente.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, según la documentación del autor.
- CPU: procesadores Intel o AMD x64; el autor menciona 16 hilos de trabajo.
- VRAM: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no disponible; el software usa Desktop Duplication, que funciona con cualquier GPU compatible con Windows.
- No cabe en GPU de consumo porque no es un modelo; el requisito es una GPU capaz de capturar pantalla a la tasa de refresco del monitor.
- Opciones de despliegue: ninguna de las habituales (vLLM, llama.cpp, Ollama, TGI) es aplicable.
- Latencia y throughput: no verificables; las cifras del autor no son auditables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Compararlo con un LLM, un modelo de visión o un sistema de recomendación carece de sentido técnico.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier uso que espere inferencia, generación o razonamiento fallará.
- El binario se distribuye sin código fuente, con contraseña fija y con instrucciones explícitas para desactivar Windows Defender y SmartScreen; esto constituye una señal de alarma de seguridad de primer orden.
- Riesgo elevado de malware: troyanos, stealers de credenciales, ransomware o mineros camuflados son habituales en paquetes de cheats distribuidos por canales no oficiales.
- La licencia MIT declarada en los metadatos no está respaldada por un archivo LICENSE verificable ni por código fuente; su aplicabilidad es dudosa.
- El uso de trampas en juegos multijugador suele violar los términos de servicio y puede acarrear sanciones legales en algunas jurisdicciones.
- Las etiquetas de idiomas (14 idiomas) no reflejan capacidades multilingües reales, sino palabras clave para posicionamiento en búsquedas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, pese a que la model card muestra insignias que afirman "106K+ descargas" y una valoración de "5.0/5"; estas cifras no son verificables y probablemente sean falsas.
- No debe ejecutarse en máquinas de desarrollo, servidores de investigación ni entornos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zrbobozrx/dubai-rp-script-2026
- Enlace de descarga citado en la model card (GitHub del autor, no verificado): https://github.com/larsmartini976/dubai-rp-script-2026/releases/latest/download/dubai-rp-script-2026-v1.2.0-win64.zip
- Página de releases citada en la model card: https://github.com/larsmartini976/dubai-rp-script-2026/releases/latest
- El resultado de búsqueda web proporcionado (una biografía de Iván Urgant en `uznayvse.ru`) no guarda relación con el repositorio y se descarta por irrelevante.
