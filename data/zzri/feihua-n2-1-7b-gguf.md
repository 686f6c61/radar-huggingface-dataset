# ZZRI/Feihua-n2-1.7B-GGUF

## Resumen

Feihua-n2-1.7B (0917) es un modelo de lenguaje conversacional de 1.707.657.216 parámetros (aproximadamente 1,7 mil millones) desarrollado por ZZRI. Su propuesta es deliberadamente inusual: el modelo razona con la claridad de su modelo base, pero genera respuestas con contenido informativo nulo, es decir, texto que suena coherente y bien construido pero que no aporta información útil. Esta técnica se conoce en chino como 废话文学 ("literatura de relleno" o "charlatanería"), un género humorístico y a la vez un caso extremo de estudio sobre coherencia superficial frente a contenido semántico.

El repositorio que nos ocupa contiene únicamente las cuantizaciones GGUF del modelo principal, publicado bajo licencia Apache 2.0 y con soporte de inglés y chino. La innovación declarada no está en el tamaño ni en la arquitectura, sino en el entrenamiento de terminación de la cadena de pensamiento: mediante una combinación de SFT de doble vía y un ciclo de GRPO, los autores elevaron la tasa de cierre natural del razonamiento del 27 % al 92 % en ocho rondas, con un coste energético declarado de 0,65 yuanes. Es decir, se ataca el problema de los modelos que entran en bucles de razonamiento infinito.

Su relevancia actual es doble. Por un lado, es un banco de pruebas barato para investigar el control de la longitud del chain-of-thought y el fenómeno de los bucles de razonamiento. Por otro, sirve como generador de datos sintéticos de relleno y como material de evaluación para detectar respuestas vacuas. La arquitectura declarada es spark2_5 (según la etiqueta del repositorio), lo que obliga a usar una compilación de llama.cpp que la soporte; no se especifica la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | spark2_5 (según etiquetas del repositorio; familia no especificada) |
| Parámetros totales | 1.707.657.216 (≈1,7 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, Q4_K_M, IQ4_XS |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el repositorio principal del modelo usa safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta spark2_5 y de la indicación de que la inferencia requiere una compilación de llama.cpp con soporte para dicha arquitectura. No se especifican el número de capas, la dimensión oculta, el tipo de atención ni si emplea GQA o atención lineal. Tampoco se documentan el número de tokens de entrenamiento ni la composición del corpus.

Lo que sí se documenta es el proceso de ajuste. El modelo parte de un modelo base (denominado "基座", base) y se somete a un SFT de doble vía: se preserva la claridad del razonamiento del modelo base mientras se entrena la generación de respuestas con cero información. A continuación se aplica un ciclo de GRPO (Group Relative Policy Optimization) orientado específicamente al cierre de la cadena de pensamiento, que elevó la tasa de terminación natural del 27 % al 92 % a lo largo de ocho rondas. El coste declarado de este entrenamiento es de 0,65 yuanes de electricidad. El resultado es un modelo que razona de forma verificable y luego responde con contenido vacío, cerrando la generación de manera limpia y puntual.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento explícito en formato de cadena de pensamiento, compatible con `--reasoning-format deepseek` en llama-server.
- Terminación controlada del razonamiento: 92 % de cierre natural de la cadena de pensamiento según los autores.
- Generación de "literatura de relleno" (废话文学): texto gramaticalmente correcto y estilísticamente plausible con densidad informativa prácticamente nula.
- Soporte de tool calling / function calling: el modelo supera la prueba de "工具调用" (llamada a herramientas) en la instantánea de aceptación.
- Comportamiento de agente: la etiqueta agent figura en el repositorio, aunque no se detallan las capacidades de multi-step reasoning.
- Sin capacidades multimodales, de audio ni de visión documentadas.
- Ajuste de muestreo recomendado por el autor: temperatura 0,6 y top_p 0,95, con frequency_penalty 0,3 opcional como seguro.

## Casos de uso

- Investigación sobre control de la longitud del chain-of-thought: el modelo permite estudiar por qué los modelos pequeños entran en bucles de razonamiento y cómo el GRPO con recompensa de terminación corrige ese comportamiento, con la curva 27 % → 92 % como referencia reproducible.
- Generación de datos sintéticos de relleno: producción de corpus de texto vacuo pero formalmente correcto para entrenar clasificadores que distingan contenido informativo de contenido de relleno, o para aumentar datasets de detección de respuestas evasivas.
- Evaluación de pipelines de razonamiento: al separar explícitamente razonamiento (claro) y respuesta (vacía), sirve como caso de prueba para verificar que un sistema de orquestación lee correctamente la traza de pensamiento y no la respuesta final.
- Bancos de pruebas de terminación en agentes: útil para medir la robustez de frameworks de agentes ante modelos que deben detener su razonamiento de forma fiable, un problema recurrente en despliegues con llama.cpp y llama-server.
- Chatbot de entretenimiento y parodia: generación de respuestas humorísticas del género 废话文学 para aplicaciones de chat en chino o inglés, donde el valor está en el efecto cómico y no en la información.
- Pruebas de estrés de interfaces conversacionales: un modelo de 1,7 B con cuantizaciones de 1,0-1,8 GB permite validar latencia, streaming y renderizado de trazas de razonamiento en hardware modesto antes de pasar a modelos mayores.
- Verificación de integración de tool calling en local: sirve para probar el enrutado de llamadas a funciones en una pila llama.cpp con soporte de la arquitectura spark2_5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, GSM8K, HumanEval u otros) en la información disponible. La model card únicamente incluye una instantánea de aceptación interna, que se reproduce a continuación:

| Prueba | Resultado |
|---|---|
| Consultas de aceptación (爱情是什么, 巧克力, 生命意义, 时间, 你是谁, 工具调用) | 6/6 superadas |
| Tres preguntas más difíciles × 3 repeticiones | 9/9 con cierre natural |
| Tasa de terminación de la cadena de pensamiento (GRPO) | 27 % → 92 % en 8 rondas |

Estos datos proceden del propio autor, no son benchmarks independientes y no permiten comparación cuantitativa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,5-2 GB con IQ4_XS (fichero de 1,0 GB) y Q4_K_M (1,1 GB), incluyendo caché KV para contextos moderados; en torno a 2,5-3 GB con Q8_0 (1,8 GB). Son estimaciones a partir del tamaño de los ficheros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente. Una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada con memoria compartida pueden ejecutarlo. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo actuales e incluso en CPU, dado el tamaño del modelo.
- Opciones de despliegue: llama.cpp y llama-server, obligatoriamente con una compilación que soporte la arquitectura spark2_5. Ollama o TGI solo funcionarían si su versión de llama.cpp subyacente incorpora dicho soporte, algo que no se puede confirmar con la información disponible. vLLM no está confirmado.
- Comando de referencia del autor: `llama-server -m feihua-n2-grpo-Q4_K_M.gguf --reasoning-format deepseek -fa on`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del modelo que permitan una comparación de rendimiento. La comparación siguiente se limita a parámetros, contexto y licencia de alternativas del mismo rango de tamaño ampliamente conocidas; los datos de contexto y licencia de los competidores provienen de información pública general y no de la búsqueda realizada para esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Feihua-n2-1.7B (0917) | 1,7 B | no disponible | Apache 2.0 | Razonamiento con respuesta sin información y terminación de CoT entrenada con GRPO |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens (dato público) | Apache 2.0 | Asistente generalista multilingüe |
| Llama-3.2-1B-Instruct | 1,23 B | 128 000 tokens (dato público) | Llama 3.2 Community License | Asistente generalista, requiere aceptar la licencia |
| SmolLM2-1.7B-Instruct | 1,7 B | 8 192 tokens (dato público) | Apache 2.0 | Asistente generalista compacto |

Rendimiento comparado: no disponible. Ninguno de los modelos alternativos comparte el objetivo de investigación del modelo descrito, por lo que no son sustitutos directos sino referencias de tamaño y coste de despliegue.

## Limitaciones y advertencias

- Por diseño, el modelo genera respuestas con densidad informativa nula. No debe usarse para tareas que requieran información factual correcta, asistencia técnica o atención al cliente real.
- Riesgo elevado de alucinación si se emplea fuera de su propósito: el texto de salida es plausible pero vacío por construcción, lo que dificulta distinguir "relleno intencionado" de error.
- Cobertura lingüística limitada a inglés y chino. No hay evidencia de soporte de castellano ni de otras lenguas.
- Longitud de contexto no documentada; se desconoce si soporta conversaciones multi-turno largas o documentos extensos.
- La arquitectura spark2_5 exige una compilación específica de llama.cpp. Es probable que falle en versiones estándar de Ollama, TGI, vLLM u otros runners hasta que incorporen dicho soporte.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y sin garantías. No se documentan restricciones adicionales.
- Los datos de aceptación (6/6, 9/9, 92 % de terminación) son internos del autor, con muy pocas muestras y sin protocolo independiente. No deben tomarse como evidencia de calidad general.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- El propio autor declara que no se ha alcanzado el techo del modelo y remite a la sección de limitaciones conocidas del repositorio principal.
- Modelo pequeño (1,7 B): capacidad de razonamiento y de seguimiento de instrucciones complejas sustancialmente inferior a la de modelos de 7 B o más.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ZZRI/Feihua-n2-1.7B-GGUF
- Repositorio principal del modelo: https://huggingface.co/ZZRI/Feihua-n2-1.7B
- llama.cpp (requiere soporte de la arquitectura spark2_5): https://github.com/ggml-org/llama.cpp
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a páginas de Instagram sin relación con el modelo.
