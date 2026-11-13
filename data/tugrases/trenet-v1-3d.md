# Tugrases/trenet-v1.3d

## Resumen

trenet v1.3d es un modelo de lenguaje de tipo decoder-only Transformer con 17,7 millones de parámetros, entrenado desde cero por el desarrollador independiente Tugrases para el idioma turco. Se trata de un experimento de investigación cuyo objetivo declarado no es competir con modelos de gran escala, sino explorar hasta dónde puede llegar un modelo de conversación cotidiana en turco entrenado en un entorno doméstico con una única tarjeta gráfica. El modelo se distribuye con licencia MIT y pesos en formato safetensors.

La arquitectura emplea atención en espacio latente (latent attention), una estructura profunda y estrecha de 12 capas, predicción multi-token durante el entrenamiento y codificación dígito a dígito de los números para favorecer la consistencia aritmética. El vocabulario es de 8192 piezas mediante BPE a nivel de byte, y la longitud de contexto alcanza los 2048 tokens. El entrenamiento se realizó en dos fases sobre aproximadamente 2000 millones de tokens: una fase de preentrenamiento de 1880 millones de tokens con texto general en turco y una fase de ajuste conversacional de 100 millones de tokens.

Su relevancia actual es fundamentalmente metodológica: documenta de forma transparente un pipeline completo de entrenamiento de un modelo pequeño desde cero, incluyendo elecciones arquitectónicas poco habituales en esta escala (atención latente, optimizador Muon para matrices y AdamW para el resto). No obstante, el propio autor lo califica de intento de investigación y desaconseja su uso en tareas serias. La model card menciona el nombre "trenet v1.3e" mientras que el identificador del repositorio es "trenet-v1.3d", una discrepancia menor a tener en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 12 capas, cuerpo estrecho, atención en espacio latente |
| Parametros totales | 17.676.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en precisión original) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, aprox. 70 MB) |
| Vocabulario | 8192 piezas, BPE a nivel de byte |
| Tokens de entrenamiento | aprox. 2000 millones (1880 M preentrenamiento + 100 M ajuste conversacional) |
| Repositorio | 0,1 GB |

## Arquitectura y entrenamiento

trenet no es una copia reducida de un modelo existente, sino un diseño concebido específicamente para escala pequeña. Emplea atención en espacio latente, donde claves y valores se comprimen en una representación latente de baja dimensión, lo que permite incluir más capas con el mismo presupuesto de parámetros y reduce el uso de memoria en inferencia. La estructura resultante es profunda y estrecha (12 capas), una elección que, según el autor, superó empíricamente a configuraciones más anchas y superficiales con el mismo número de parámetros. Incorpora componentes actuales como RoPE (codificación posicional rotatoria), normalización de query-key, RMSNorm y SwiGLU.

El entrenamiento se dividió en dos etapas. La primera, de preentrenamiento, consumió 1880 millones de tokens de texto general en turco con una mezcla de enciclopedias, web, relatos, diálogo y matemáticas. La segunda, de ajuste conversacional, utilizó 100 millones de tokens de conversaciones cotidianas, pares pregunta-respuesta, seguimiento de instrucciones y cálculos mostrados paso a paso. En optimización se usó Muon para los pesos matriciales y AdamW para el resto, con precisión mixta bf16 y una duración de pocas horas en una única GPU. El dataset no se publica. Como innovación adicional, el modelo predice no solo el siguiente token sino también el posterior durante el entrenamiento, añadiendo señal de aprendizaje, y codifica los números dígito a dígito para mantener la consistencia aritmética.

## Capacidades

- Generación de texto conversacional breve y cotidiano en turco: saludos, cortesías y preguntas simples.
- Memoria dentro de la conversación: recuerda varios datos aportados en un mismo mensaje (nombre, edad, ciudad, nombre de una mascota).
- Seguimiento de instrucciones simples: listas cortas, respuestas de una sola frase, restricciones del tipo "escribe solo esto".
- Aritmética básica de cuatro operaciones y cálculos de porcentajes o descuentos cuando se le guía paso a paso.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Multilingüismo limitado al turco; no se documenta soporte de otros idiomas.

## Casos de uso

- Prototipado de chatbots conversacionales en turco para entornos de investigación: el modelo mantiene conversaciones multi-turno dentro de sus 2048 tokens de contexto y sirve para validar pipelines de diálogo antes de escalar a modelos mayores.
- Demostración educativa de entrenamiento de modelos desde cero: su tamaño reducido (17,7 M de parámetros, unos 70 MB de pesos) permite reproducir y estudiar el ciclo completo de preentrenamiento y ajuste en hardware doméstico.
- Pruebas de integración de infraestructura de inferencia: al ejecutarse en CPU y en GPU de consumo, resulta útil para validar despliegues con scripts propios, verificar tokenizadores o comparar latencias en pipelines de generación de texto.
- Ejercicios controlados de aritmética guiada: con el script `chat.py` y su calculadora auxiliar, puede emplearse como banco de pruebas para estudiar la consistencia numérica de modelos pequeños en operaciones de descuento y porcentaje.
- Experimentos de ajuste fino de bajo coste: la licencia MIT y el reducido tamaño de los pesos permiten reentrenar o adaptar el modelo en una sola GPU de consumo para investigar técnicas de alineación o estilos conversacionales en turco.
- Evaluación comparativa de arquitecturas pequeñas: su combinación de atención latente, predicción multi-token y optimizador Muon lo convierte en un caso de estudio para medir el impacto de estas decisiones en modelos de menos de 50 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión original (pesos de aproximadamente 70 MB más estados de activación y caché KV para 2048 tokens); no se dispone de cifras oficiales de memoria pico.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente; el autor indica que el entrenamiento se realizó en una única tarjeta gráfica de un ordenador doméstico, sin especificar el modelo.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU consumer; también funciona en CPU mediante la opción `--device cpu` del script incluido.
- Opciones de despliegue: el repositorio incluye el paquete `trenet/` y el script `chat.py` basados en PyTorch, tokenizers y safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trenet v1.3d | 17,7 M | 2048 tokens | Turco | MIT | Hugging Face (68 descargas) |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría y escala en la documentación proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El propio autor advierte de que es un intento de investigación y que no debe usarse en tareas serias ni como fuente de información.
- Riesgo elevado de alucinación: inventa respuestas verosímiles pero incorrectas en temas que desconoce.
- No apto para redacción de textos largos, traducción, generación de código ni razonamiento real; estas capacidades quedan fuera de su escala.
- Puede confundir operaciones en problemas verbales de varios pasos y fallar en preguntas de ordenación (quién es mayor, quién es más alto).
- Dificultad para parafrasear: con frecuencia repite la frase original en lugar de reformularla.
- Pérdida de hilo en conversaciones largas dentro de la ventana de 2048 tokens.
- Soporte limitado al turco; no se documentan capacidades en otros idiomas.
- Licencia MIT: permite uso comercial, modificación y distribución siempre que se conserve la línea de copyright del texto de la licencia; no obstante, la calidad del modelo hace desaconsejable su uso en producción.
- El dataset de entrenamiento no se publica, lo que limita la auditoría de sesgos y de la composición de los datos.
- Discrepancia menor entre el nombre del repositorio (trenet-v1.3d) y el título de la model card (trenet v1.3e).

## Enlaces

- Hugging Face: https://huggingface.co/Tugrases/trenet-v1.3d
