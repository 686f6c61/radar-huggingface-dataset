# turmflx/vocal-range-test

## Resumen
Este repositorio no contiene un modelo de inteligencia artificial generativa, sino una aplicación web de análisis vocal denominada Vocal-Range-Tester, desarrollada por el usuario turmflx. La herramienta permite a cantantes novatos descubrir su rango vocal natural mediante un test guiado que se ejecuta íntegramente en el navegador. El problema que resuelve es la dificultad de saber qué canciones se adaptan a la propia voz sin acceso a un coach vocal presencial. La relevancia actual radica en su enfoque de privacidad: todo el procesamiento de audio se realiza localmente, sin subir grabaciones a servidores. No se trata de un modelo con arquitectura de red neuronal ni con parámetros entrenados; es una aplicación frontend que utiliza APIs de audio del navegador y algoritmos de detección de tono.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | No aplicable (aplicación web de análisis vocal, no es un modelo de IA) |
| Parámetros totales | No disponible (no hay modelo entrenado) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable |
| Tipos de cuantización | No aplicable |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | No aplicable (no hay pesos de modelo) |

## Arquitectura y entrenamiento
La aplicación se basa en el procesamiento de señal de audio en tiempo real dentro del navegador. No existe un modelo de aprendizaje profundo ni una fase de entrenamiento con datos. El análisis de tono se realiza mediante algoritmos de detección de frecuencia (posiblemente autocorrelación o YIN) sobre las muestras capturadas por el micrófono, aplicando un filtro de ruido para descartar picos inestables. No se han publicado datos sobre el conjunto de datos de entrenamiento, ni se ha aplicado RLHF o DPO. La innovación técnica destacable es que todo el cálculo ocurre en el lado del cliente, lo que garantiza la privacidad del usuario.

## Capacidades
- Detección del rango vocal estable: guía al usuario en un flujo de grabación paso a paso y calcula las notas más graves y agudas que puede sostener.
- Filtro inteligente de ruido: descarta picos vocales cortos e inestables para obtener una medición fiable.
- Visualización de la curva de tono en tiempo real mientras el usuario canta.
- Generación de un informe personalizado con clasificación del tipo de voz, comparación con cantantes famosos y recomendaciones de canciones adaptadas al rango medido.
- Piano virtual simplificado y optimizado para móviles, con función de filtrado de teclas para mostrar solo las necesarias.
- Guardado local de informes para hacer seguimiento de la evolución vocal a lo largo del tiempo.
- Todo el procesamiento de audio es local; no se transmite ninguna grabación a servidores remotos.

## Casos de uso
- Aficionados al karaoke: la herramienta permite seleccionar canciones que se ajusten al rango vocal propio, evitando temas demasiado agudos o graves.
- Estudiantes de canto y profesores: sirve como referencia informal rápida para comprobar el rango vocal antes o después de una clase, sin necesidad de equipamiento especializado.
- Coristas y actores de teatro: permite realizar comprobaciones rápidas de rango vocal para asignar partes corales o papeles musicales.
- Músicos que practican melodías en móvil: el piano virtual con teclas filtradas facilita practicar una melodía concreta con una sola mano en pantallas pequeñas.
- Usuarios preocupados por la privacidad: al no subir audio a ningún servidor, es adecuado para quienes no quieren compartir grabaciones de su voz.
- Cantantes en formación que quieren monitorizar su progreso: el guardado local de informes permite comparar el rango vocal a lo largo del tiempo y detectar mejoras.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- No requiere GPU ni VRAM, al no tratarse de un modelo de IA.
- Se necesita un navegador web moderno con soporte para Web Audio API y acceso al micrófono.
- Funciona en ordenadores de escritorio y en móviles (el piano está optimizado para táctil).
- El rendimiento depende de la capacidad del dispositivo para procesar audio en tiempo real; en móviles de gama baja puede haber mayor latencia.
- No se requiere instalación de software adicional; se accede a través del sitio web oficial.

## Comparativa con modelos similares
Este repositorio no es comparable con modelos de IA generativa. Puede compararse con otras herramientas web de análisis de rango vocal, como vocalrangetest.com y anytospeech.com. La tabla siguiente recoge las características conocidas:

| Característica | Vocal-Range-Tester (turmflx) | vocalrangetest.com | anytospeech.com |
|---|---|---|---|
| Código abierto | Sí (licencia MIT) | No disponible | No disponible |
| Análisis local en navegador | Sí | No disponible | No disponible |
| Piano virtual integrado | Sí | No disponible | No disponible |
| Comparación con cantantes | Sí | No disponible | Sí (según la descripción) |
| Precio | No disponible | No disponible | Gratis (según la descripción) |

## Limitaciones y advertencias
- La herramienta está diseñada para práctica amateur y no puede sustituir la evaluación de un profesor de canto profesional.
- Solo calcula notas estables sostenidas; no incluye técnicas vocales extremas ni registros no convencionales.
- El piano móvil está pensado para entrenamiento casual de melodías, no como instrumento completo.
- No se han publicado benchmarks ni validaciones científicas de la precisión del análisis de tono.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto reciente con poca tracción.
- La interfaz está disponible solo en inglés; no hay soporte oficial para otros idiomas.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/turmflx/vocal-range-test
- Sitio web del proyecto: https://vocalrangetest.org
- Herramienta similar con análisis de voz por IA: https://vocalrangetest.com/ai-voice-analysis/
- Test de rango vocal gratuito en línea: https://anytospeech.com/vocal-range-test
