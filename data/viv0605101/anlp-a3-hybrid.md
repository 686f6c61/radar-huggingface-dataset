# Viv0605101/anlp-a3-hybrid

## Resumen

`Viv0605101/anlp-a3-hybrid` es un modelo de investigación de pequeño tamaño (3.113.490 parámetros según los pesos en safetensors; la model card declara 962.796 parámetros de red, sin contar el front-end de tablas) publicado como entrega del Assignment 3 de la asignatura Advanced NLP (ANLP) en IIIT. Su tarea no es la generación de lenguaje general, sino la decodificación de un cifrado simbólico: recibe texto cifrado y produce el texto en claro correspondiente. La arquitectura se describe como un híbrido Mamba-DeltaNet, es decir, combina capas de espacio de estados con capas de atención lineal tipo DeltaNet.

El modelo no aprende la clave del cifrado. El autor indica explícitamente que la recurrencia del front-end elimina el flujo de clave y que unas tablas por posición, contadas sobre el split de entrenamiento y almacenadas en el buffer `sym_table`, mapean cada símbolo a un token de letra o a un token desconocido. La red se limita a copiar los tokens conocidos y a rellenar los desconocidos a partir del contexto ya decodificado. Se entrenó durante 2.000 pasos.

Es relevante únicamente como artefacto docente y como referencia reproducible de un pipeline de decodificación con front-end determinista más modelo neuronal. No es un modelo de propósito general: no hay pipeline declarado, no hay licencia, no hay idiomas declarados y el repositorio ocupa 0.0 GB. Cualquier evaluación de utilidad práctica debe hacerse contra su tarea concreta (descifrado del split de test del assignment), no como LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrido Mamba-DeltaNet (SSM + atención lineal) con front-end recurrente y tablas por posición |
| Parámetros totales | 3.113.490 (safetensors); la model card declara 962.796 parámetros de red |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | pesos en 8-bit (tag `8-bit`); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería PyTorch, `PyTorchModelHubMixin`) |

## Arquitectura y entrenamiento

La arquitectura combina dos familias de bloques: capas Mamba (modelo de espacio de estados selectivo, con recurrencia lineal en la longitud de secuencia) y capas DeltaNet (atención lineal con regla de actualización delta sobre una memoria asociativa matricial). El prefijo "hybrid" de la model card indica que ambos tipos se intercalan en la red. El front-end es determinista: una recurrencia elimina el flujo de clave y unas tablas de símbolos por posición (`sym_table`), calculadas sobre el split de entrenamiento, traducen cada símbolo a un token de letra o a un token desconocido. La red neuronal solo resuelve los símbolos desconocidos usando el contexto decodificado, de modo que no se aprende la clave sino el mapeo residual.

El entrenamiento declarado es de 2.000 pasos. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado adicional. Existen ramas del mismo repositorio con etapas anteriores: `rule-inputs` (entradas de candidatos por reglas) y `step-inputs` (entradas de paso y posición), lo que sugiere una ablación progresiva del diseño de entradas del front-end. El informe enviado (`2024122002_a3.pdf`) está incluido en el repositorio.

## Capacidades

- Decodificación de texto cifrado a texto en claro para el esquema de cifrado del assignment, con exact match del 99,17 % en test.
- Eliminación de flujo de clave mediante recurrencia en el front-end, sin aprendizaje de la clave.
- Relleno de símbolos desconocidos a partir del contexto decodificado, apoyado en las tablas `sym_table`.
- Procesamiento por símbolos con tablas dependientes de la posición.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; los idiomas no están declarados.
- No se documenta visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción del assignment: ejecutar `bash scripts/part1/test_assn.sh` desde el repositorio de código para descargar el modelo y decodificar el split de test, verificando las métricas publicadas.
- Estudio de arquitecturas híbridas SSM + atención lineal: el modelo sirve como banco de pruebas a pequeña escala (3,1 M de parámetros) para medir coste y precisión de intercalar Mamba y DeltaNet en una tarea secuencial.
- Comparación de diseños de front-end: las ramas `rule-inputs` y `step-inputs` permiten contrastar el efecto de distintas representaciones de entrada sobre la exactitud de decodificación.
- Docencia de evaluación: usar las métricas de exact match, precisión de carácter, precisión de palabra y Levenshtein medio como ejemplo de protocolo de evaluación en tareas de transcripción exacta.
- Referencia de empaquetado: el uso de `PyTorchModelHubMixin` y safetensors en 8-bit sirve como ejemplo mínimo de publicación de un checkpoint con pesos cuantizados en el Hub.
- Análisis de robustez de tablas simbólicas: estudiar cómo degrada la precisión cuando el vocabulario de test contiene símbolos no vistos en entrenamiento, dado el uso de un token desconocido.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Split | Exact match (%) | Precisión de carácter (%) | Precisión de palabra (%) | Levenshtein medio |
|---|---|---|---|---|
| Validación | 99,05 | 99,998 | 99,93 | 0,014 |
| Test | 99,17 | 99,988 | 99,16 | 0,111 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión razonable, dado el tamaño de 3,1 M de parámetros (unos 12,5 MB en fp32 y unos 3,1 MB en 8-bit) más el buffer `sym_table`.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100 ni H100. Una GTX 1050 o una iGPU con soporte CUDA/ROCm es suficiente.
- Cabe en cualquier GPU de consumo, incluida la gama baja, y probablemente en CPU con latencia aceptable para lotes pequeños.
- Opciones de despliegue: PyTorch nativo mediante `PyTorchModelHubMixin`; no hay confirmación de soporte en vLLM, llama.cpp, Ollama ni TGI, y estos motores no están orientados a arquitecturas híbridas Mamba-DeltaNet personalizadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables de la misma categoría (decodificadores de cifrado con arquitectura híbrida SSM + atención lineal y front-end determinista). Como referencia de tamaño, los modelos híbridos Mamba-2 publicados por la comunidad suelen partir de cientos de millones de parámetros, muy por encima de este checkpoint.

## Limitaciones y advertencias

- Modelo de assignment académico: no está diseñado ni validado para uso en producción.
- La decodificación depende de tablas `sym_table` calculadas sobre el split de entrenamiento; fuera de la distribución del assignment la precisión puede caer drásticamente.
- No aprende la clave del cifrado: si cambia el esquema de cifrado o el flujo de clave, el front-end deja de ser válido.
- Licencia no disponible: no se puede asumir permiso de uso comercial.
- Idiomas no declarados; no hay evidencia de comportamiento multilingüe.
- Riesgo de alucinación en los símbolos marcados como desconocidos, ya que la red los rellena por contexto en lugar de por evidencia criptográfica.
- Sin pipeline declarado en el Hub ni documentación de inferencia más allá del script del repositorio de código.
- El repositorio ocupa 0.0 GB y no incluye datos de entrenamiento; la reproducibilidad completa depende del repositorio externo en `code.iiit.ac.in`.
- Discrepancia entre el recuento de parámetros de la model card (962.796) y el de los safetensors (3.113.490): conviene verificar qué incluye cada cifra antes de citarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Viv0605101/anlp-a3-hybrid
- Código y comandos (commit a5ab590): https://code.iiit.ac.in/advanced-nlp/m26-assignment3-vidvathama.babu
- Rama con entradas de candidatos por reglas: https://huggingface.co/Viv0605101/anlp-a3-hybrid/tree/rule-inputs
- Rama con entradas de paso y posición: https://huggingface.co/Viv0605101/anlp-a3-hybrid/tree/step-inputs
- Informe enviado: `2024122002_a3.pdf` en el repositorio del modelo
