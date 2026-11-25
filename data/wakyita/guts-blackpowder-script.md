# WakyITA/guts-blackpowder-script

## Resumen

El repositorio `WakyITA/guts-blackpowder-script` no contiene un modelo de IA. Se trata de un paquete distribuido como binario portable para Windows x64 (un archivo `.zip` de 4,8 MB con contraseña) que la propia model card describe como un *game cheat*: un conjunto de módulos de escaneo de offsets, superposición externa (ESP de cajas y esqueletos), suavizado de entrada tipo Bézier y una capa de ocultación frente a capturas de pantalla (OBS, ShadowPlay, Discord). No hay pesos, tokenizador, configuración de transformer ni artefactos de inferencia de ningún tipo.

El autor etiqueta el repositorio con un listado amplio de idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) y licencia MIT, pero esas etiquetas no corresponden a capacidades lingüísticas de un modelo: son metadatos de descubrimiento para el paquete. El campo `pipeline` está vacío, el recuento de descargas y *likes* es cero y la fecha de creación (2026-11-24) aparece en el futuro respecto al momento habitual de consulta, lo que refuerza la naturaleza anómala del artefacto.

Desde la perspectiva de evaluación de modelos, esta ficha no puede aportar especificaciones técnicas de arquitectura, entrenamiento o benchmarks porque no existen. El interés, si acaso, es de seguridad: el patrón (binario con contraseña, instrucciones de "ejecutar como administrador", desactivación implícita de SmartScreen y referencias cruzadas a repositorios de GitHub ajenos al autor declarado) es característico de campañas de distribución de *malware*. No debe descargarse ni ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las etiquetas de idioma del repo no implican capacidad lingüística) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No aplica. No hay arquitectura de red neuronal, ni datos de entrenamiento, ni proceso de ajuste (RLHF, DPO u otro). El contenido del repositorio, según la propia model card, es un ejecutable `dandys-world-forsaken-script-2026-v1.2.2-win64.exe` (build `B3E21E`, versión `v4.7.8`) acompañado de perfiles JSON de configuración. Los módulos descritos (escáner dinámico de offsets, *panic key* con la tecla `END`, superposición externa a 144 Hz, suavizado Bézier de entrada) son componentes típicos de software de trampas para videojuegos, no de un sistema de aprendizaje automático.

La model card menciona métricas de rendimiento del binario (menos de 52 MB de RAM, menos de 8 ms de respuesta, 11 hilos de trabajo), pero son cifras autoinformadas por el autor y no verificables ni relevantes para la evaluación de un modelo.

## Capacidades

- No hay generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte de *tool calling* ni de *function calling*.
- No hay capacidades de agente ni de razonamiento multi-paso.
- No hay capacidades multilingües reales pese a las etiquetas de idioma.
- El binario declara funciones de *cheat* para videojuegos: ESP (cajas 2D/3D, esqueletos de huesos, distancias), suavizado de apuntado con radio de FOV configurable, perfiles intercambiables en caliente y ocultación frente a capturas de pantalla.

## Casos de uso

No existen casos de uso legítimos como modelo de IA. Los escenarios que la model card plantea son:

- Uso como *cheat* en videojuegos multijugador: el binario se ejecuta como administrador y aplica superposición externa sobre el juego. Viola con casi total seguridad los términos de servicio de cualquier juego y puede conllevar el baneo de la cuenta.
- Ocultación de la superposición en retransmisiones: la capa "stream-proof" está diseñada para excluir la ventana del binario de OBS, ShadowPlay y Discord, lo que facilita el uso encubierto en directo.
- Distribución con contraseña (`2026`) y sin verificación de integridad: patrón habitual para evadir análisis automáticos de antivirus y de plataformas.
- Ejecución con privilegios elevados en Windows: el binario solicita "Run as Administrator", lo que amplía el impacto de cualquier comportamiento malicioso.
- No es adecuado para atención al cliente, generación de código, análisis de documentos, RAG, agentes ni ninguna otra tarea de IA.
- Se desaconseja su descarga y ejecución en cualquier entorno, incluido un equipo de pruebas sin aislamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras del repositorio son autoinformadas sobre el binario (4,8 MB de tamaño, menos de 52 MB de RAM, menos de 8 ms de respuesta, más de 144 Hz de refresco de superposición) y no son verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits (x64), en procesadores Intel y AMD.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card son del binario, no de un modelo.

## Comparativa con modelos similares

No disponible. No hay modelos comparables porque el artefacto no es un modelo de IA. Cualquier comparación con LLM de texto, modelos multimodales o sistemas de agentes sería categóricamente incorrecta.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni imágenes.
- Riesgo de seguridad alto: binario cerrado, distribuido con contraseña, solicitando privilegios de administrador y con instrucciones para saltarse advertencias de SmartScreen y Windows Defender. Es un patrón clásico de *dropper* o *malware*.
- Enlaces cruzados a repositorios de GitHub de terceros (`pedrolong1343/...`) distintos del autor declarado (`MichelleFerrari` / `WakyITA`), lo que sugiere suplantación o redirección a infraestructura no controlada.
- Fecha de creación futura (2026-11-24) y contadores de descargas y *likes* a cero: indicios de metadatos inconsistentes.
- Etiquetas de idioma y de licencia MIT engañosas: no describen capacidades del artefacto.
- Uso en juegos multijugador: violación probable de los términos de servicio y riesgo de sanción en la cuenta.
- No apto para producción, investigación ni evaluación académica.
- La licencia MIT declarada no otorga ninguna garantía sobre el contenido del binario ni exime de responsabilidad legal por su uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WakyITA/guts-blackpowder-script
- Repositorio GitHub referenciado en la model card (tercero, no verificado): https://github.com/MichelleFerrari/guts-blackpowder-script
- Repositorio GitHub referenciado en la model card (tercero, no verificado): https://github.com/pedrolong1343/dandys-world-forsaken-script-2026
- No se han encontrado papers, blogs, demos ni documentación técnica asociados al artefacto.
