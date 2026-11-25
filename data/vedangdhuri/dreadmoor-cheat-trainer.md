# vedangdhuri/dreadmoor-cheat-trainer

## Resumen

El artefacto publicado bajo el identificador `vedangdhuri/dreadmoor-cheat-trainer` en Hugging Face no es un modelo de inteligencia artificial. Se trata de un paquete binario para Windows x64 distribuido como archivo ZIP (4,8 MB) que se presenta como un *trainer* o *cheat* para el videojuego Kingdom Come: Deliverance 2, con instrucciones de instalación, contraseña de descompresión y enlaces de descarga alojados en GitHub.

La model card no contiene información sobre arquitectura de red neuronal, parámetros, tokenizador, datos de entrenamiento ni proceso de ajuste. Los metadatos de Hugging Face únicamente reflejan etiquetas de plataforma (`windows`, `windows-11`, `x64`, `portable`) y una lista de catorce idiomas declarados, sin que exista ningún artefacto de pesos asociado.

Desde la perspectiva de evaluación de modelos, esta ficha no puede cumplir los apartados técnicos habituales: no hay modelo que analizar. El contenido es relevante únicamente como ejemplo de publicación abusiva en un hub de modelos, un patrón que conviene reconocer y reportar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un ejecutable `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El repositorio no contiene ficheros de pesos en ningún formato (safetensors, GGUF, PyTorch bin, ONNX ni similares), ni configuración de transformer, MoE, SSM o arquitectura híbrida. Tampoco hay tokenizador, pipeline declarado ni dataset de entrenamiento documentado.

El contenido descrito en la model card corresponde a un ejecutable (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, build `v3.2.6 (A80455)`) empaquetado en un ZIP de 4,8 MB con contraseña de extracción `2026`. El texto menciona módulos de superposición externa, suavizado de entrada Bézier, *panic key* y exclusión de captura de pantalla, funcionalidades propias de software de trampas para videojuegos, no de un sistema de aprendizaje automático.

## Capacidades

- No hay capacidades de generación de texto, razonamiento, código, matemáticas ni visión: el artefacto no es un modelo lingüístico.
- No hay soporte de *tool calling* ni de *function calling*.
- No hay soporte de agentes ni de razonamiento multi-paso.
- Multilingüe: los catorce idiomas figuran como etiquetas de metadatos, sin evidencia de capacidad lingüística real.
- El binario descrito implementa funciones de *overlay* externo, *ESP* de distancias, *aim assist* con curvas humanizadas y perfiles JSON intercambiables en caliente, según la propia model card.

## Casos de uso

No procede. Un artefacto de este tipo no tiene aplicación legítima como modelo de IA ni como componente de software para desarrolladores o investigadores. Los escenarios planteados por el autor (uso de trampas en un videojuego concreto en Windows 11 de 64 bits) quedan fuera del alcance de esta ficha y, además, infringen habitualmente los términos de servicio de los juegos y pueden contravenir la legislación sobre protección de servicios y derechos de autor en la Unión Europea.

- Evaluación de riesgos de cadena de suministro: útil únicamente como muestra de publicación maliciosa o spam en un hub de modelos, para calibrar filtros de moderación.
- No se identifican otros casos de uso legítimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, porque no hay modelo subyacente que evaluar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay pesos de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles.
- Requisito real declarado por el autor: sistema Windows 10 u 11 de 64 bits (x64), ejecución como administrador y 4,8 MB de espacio en disco para el archivo ZIP.

## Comparativa con modelos similares

No disponible. No existe categoría de modelo comparable; el artefacto no es un modelo de lenguaje, visión ni multimodal. Cualquier comparación con modelos open source reales sería engañosa.

## Limitaciones y advertencias

- El artefacto no es un modelo de IA pese a estar alojado en Hugging Face; los metadatos de idioma y licencia MIT no implican capacidades lingüísticas.
- Riesgo de seguridad alto: se distribuye un ejecutable de procedencia no verificada, con enlaces de descarga alojados en repositorios de GitHub de terceros y contraseña de descompresión, un patrón habitual para evadir análisis automatizados de malware.
- La propia model card reconoce que Windows Defender y SmartScreen generan alertas y recomienda desactivarlas o añadir exclusiones, práctica que no debe seguirse en ningún entorno de producción.
- El uso de *cheats* en juegos multijugador puede suponer el baneo de cuentas y, en algunas jurisdicciones, responsabilidad legal.
- No hay evidencia de auditoría, firma de código ni trazabilidad del binario.
- Cero descargas y cero *likes* en el momento de la consulta; repositorio creado y actualizado el mismo día (24 de noviembre de 2026), lo que sugiere una publicación automatizada.
- Recomendación: no descargar ni ejecutar el contenido; reportar el repositorio a Hugging Face por uso indebido de la plataforma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vedangdhuri/dreadmoor-cheat-trainer
- Enlace de descarga citado en la model card (GitHub, no verificado): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Repositorio GitHub citado (no verificado): https://github.com/rhill87/dreadmoor-cheat-trainer
- No se han encontrado papers, blogs técnicos ni demos asociados.
