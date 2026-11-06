# TheAfterHoursClub/TAHC-Survival-AI

## Resumen

TAHC Survival AI es una distribución offline de los modelos Gemma 4 de Google, empaquetada por The After Hours Club en formato GGUF para su ejecución local en teléfonos y ordenadores sin conexión a internet. No se trata de un modelo entrenado desde cero, sino de una configuración de los modelos instructos Gemma 4 (E2B, E4B y 12B) cuyos pesos, convertidos a GGUF por Unsloth, se distribuyen renombrados pero sin modificaciones. Su propósito es servir como asistente de supervivencia y consulta general que funcione de forma privada y autónoma, sin depender de servicios en la nube.

Su relevancia radica en el creciente interés por la IA local y privada: al basarse en Gemma 4 con cuantización por matriz de importancia (imatrix), ofrece variantes que van desde unos 3 GB (ejecutables en móviles con 6 GB de RAM) hasta unos 7 GB (para equipos con 16 GB o más). El modelo base es google/gemma-4-E2B-it, con referencias también a las variantes E4B y 12B, y el conjunto se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 4, arquitectura detallada no disponible) |
| Parámetros totales | 11.907.350.576 (dato de safetensors del repo; las variantes E2B, E4B y 12B difieren) |
| Parámetros activos | no disponible (Gemma 4 E2B/E4B podrían ser MoE, dato no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con imatrix (niveles exactos no disponibles; variantes de ~3 GB, ~5 GB y ~7 GB) |
| Idiomas soportados | no disponible (Gemma 4 es multilingüe, lista concreta no publicada en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversiones de Unsloth) |

## Arquitectura y entrenamiento

TAHC Survival AI no modifica los pesos originales: es una reconfiguración y redistribución de los modelos Gemma 4 instructos de Google (gemma-4-E2B-it, gemma-4-E4B-it y gemma-4-12b-it), convertidos a GGUF por Unsloth. La cuantización emplea imatrix (matriz de importancia), una técnica que calcula estadísticas de activación sobre un corpus de calibración para reducir la pérdida de calidad en cuantizaciones agresivas, lo que permite que variantes de 3 a 7 GB mantengan un rendimiento razonable.

Sobre el entrenamiento de los modelos base Gemma 4 (número de tokens, composición del dataset, uso de RLHF/DPO o destilación), la información proporcionada no incluye detalles. La variante E2B sugiere una posible arquitectura eficiente (posiblemente MoE con parámetros activos reducidos, siguiendo el patrón de Gemma 3n), pero esto no está confirmado en la documentación disponible, por lo que no se puede afirmar categóricamente.

## Capacidades

- Generación de texto conversacional en modo chat (tag `conversational` en Hugging Face).
- Consultas de supervivencia y conocimientos generales en entornos sin conectividad.
- Capacidades de razonamiento, código y matemáticas heredadas de Gemma 4 instructo (sin datos de benchmark específicos en la ficha).
- Ejecución completamente offline en móvil y escritorio, sin envío de datos a servidores.
- Multilingüismo heredado de la familia Gemma (lista de idiomas no disponible).
- No hay evidencia en la ficha de soporte de tool calling, agentes, visión o audio; la distribución se centra en texto conversacional.

## Casos de uso

- Guía de supervivencia offline: consulta de primeros auxilios, orientación, purificación de agua o construcción de refugios en expediciones, senderismo o zonas sin cobertura, donde no existe alternativa basada en nube.
- Preparación ante emergencias: incluir el modelo en kits de emergencia domésticos (apagones, catástrofes naturales) para disponer de un asistente de conocimiento sin depender de infraestructura de red.
- Privacidad en consultas sensibles: usuarios que deseen preguntar sobre temas de salud o personales sin que los datos salgan del dispositivo, gracias a la ejecución 100 % local.
- Uso en dispositivos móviles de gama media: la variante Phone (~3 GB) permite ejecutar el asistente en iPhone o Android con 6 GB o más de RAM mediante runtimes GGUF compatibles.
- Asistente en portátiles antiguos o de gama baja: la variante Standard (~5 GB) está pensada para equipos con 8–15 GB de RAM, útil en contextos educativos o de trabajo sin conexión.
- Documentación y redacción sin internet: redacción, resumen y revisión de textos en entornos aislados (aviones, zonas rurales, instalaciones seguras) con la variante Max (~7 GB) en equipos con 16 GB o más de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de pesos sin modificar de Gemma 4, el rendimiento teórico corresponde al de los modelos base google/gemma-4-E2B-it, E4B-it y 12B-it, cuyos resultados oficiales no constan en la documentación proporcionada.

## Requisitos de hardware

- Variante Phone (~3 GB GGUF): iPhone o Android con 6 GB o más de RAM; ejecutable mediante apps compatibles con GGUF (llama.cpp, Ollama en Android, MLC Chat u otras, según la guía del autor).
- Variante Standard (~5 GB GGUF): portátiles y sobremesa con 8–15 GB de RAM; viable en CPUs modernas sin GPU dedicada.
- Variante Max (~7 GB GGUF): equipos con 16 GB o más de RAM; en GPU, una tarjeta con 8 GB de VRAM (por ejemplo RTX 3060/4060) debería alojarlo cómodamente.
- No se requiere GPU para el uso previsto (inferencia en CPU y móvil); con GPU compatible, runtimes como llama.cpp aceleran la inferencia.
- Despliegue: cualquier runtime GGUF (llama.cpp, Ollama, LM Studio, Jan); el autor proporciona una guía de instalación y un preset propio en https://tahc-offline-ai.vercel.app.
- Latencia y throughput: no disponibles; en cuantizaciones de este tamaño se puede esperar generación fluida en CPU de escritorio moderna y en móviles de gama media-alta, sin cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| TAHC Survival AI | ~12 B (base 12B; variantes E2B/E4B menores) | GGUF (imatrix) | no disponible | Apache 2.0 | Asistente offline de supervivencia, redistribución de Gemma 4 |
| google/gemma-4-E2B-it | no disponible (E2B) | safetensors | no disponible | Gemma (no disponible en esta ficha) | Modelo base instructo generalista |
| unsloth/gemma-4-E2B-it-GGUF | igual al base | GGUF | no disponible | Apache 2.0 | Conversión GGUF sin renombrado ni empaquetado |

En la práctica, TAHC Survival AI compite con otras distribuciones GGUF locales de modelos pequeños (Llama, Qwen, Phi en cuantizaciones de 3–7 GB), pero su diferenciador es el empaquetado y preset orientado a supervivencia y uso offline sencillo. Datos comparativos de rendimiento no disponibles.

## Limitaciones y advertencias

- El propio autor advierte de que las respuestas de la IA pueden ser incorrectas y que el modelo no debe usarse como consejo médico, legal ni de emergencia; crítico en un producto orientado a supervivencia.
- Los pesos no están modificados ni afinados para supervivencia: el enfoque temático depende del preset y las instrucciones de sistema de TAHC, no de un ajuste fino específico.
- Sesgos: heredados de los datos de entrenamiento de Gemma 4; no se han documentado sesgos específicos en la ficha.
- Riesgo de alucinación: propio de modelos de lenguaje generales; en escenarios de emergencia las respuestas deben verificarse con fuentes fiables.
- Longitud de contexto e idiomas soportados: no disponibles en la documentación proporcionada.
- La redistribución renombrada de modelos de terceros, aunque declarada bajo Apache 2.0 con créditos a Google y Unsloth, implica depender de un empaquetador no afiliado a Google para actualizaciones y soporte.
- Descargas aún limitadas (825) y sin comunidad activa (0 likes), lo que sugiere escaso historial de uso en producción.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/TheAfterHoursClub/TAHC-Survival-AI
- Guía de instalación y preset de TAHC: https://tahc-offline-ai.vercel.app
- Modelos base: https://huggingface.co/google/gemma-4-E2B-it, https://huggingface.co/google/gemma-4-E4B-it, https://huggingface.co/google/gemma-4-12b-it
- Conversiones GGUF de Unsloth: https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF (y variantes E4B/12B equivalentes)
- Paper, demo y repositorio adicional: no disponibles
