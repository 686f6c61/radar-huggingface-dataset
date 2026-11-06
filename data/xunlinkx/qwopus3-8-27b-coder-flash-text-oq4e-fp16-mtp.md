# xunlinkx/Qwopus3.8-27B-Coder-Flash-Text-oQ4e-fp16-mtp

## Resumen

Qwopus3.8-27B-Coder-Flash-Text-oQ4e-fp16-mtp es una cuantización de 4 bits en formato MLX del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un LLM denso de aproximadamente 27.000 millones de parámetros orientado a generación de código. La ha preparado el usuario xunlinkx mediante el pipeline de cuantización oMLX, y está pensada para ejecutarse en Apple Silicon con un consumo de memoria unificado muy contenido (unos 13,8 GB de pesos).

La particularidad de esta edición es doble. Por un lado, es una versión "Text-Only": se han eliminado los 27 bloques visuales del transformer de visión, los tokens de proyección de imagen y las configuraciones del procesador de vídeo, lo que ahorra unos 2,2 GB de memoria y acelera el arranque en frío. Por otro, conserva en FP16 las cabezas de predicción multi-token (MTP) del modelo original, lo que permite decodificación especulativa y un aumento de throughput de aproximadamente 1,4x a 1,7x en tareas de código y razonamiento agéntico.

El resultado es un checkpoint especializado en agentes de código headless, harnesses de terminal (Hermes, OpenCode) y flujos de desarrollo multi-turno, que cabe en Macs de 18, 24 y 32 GB de memoria unificada. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer denso, solo texto) |
| Parámetros totales | 27.320.697.856 (~27B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit mixta mejorada (oQ4e) con cuantización afín, group size 64; capas sensibles en 5-bit/6-bit; pesos no cuantizados, escalas, sesgos, normas y embeddings en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen 3.5 en su variante de texto (`qwen3_5_text`), con aproximadamente 27B de parámetros. La model card del autor de la cuantización no detalla la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO; esa información correspondería al modelo original Jackrong/Qwopus3.8-27B-Coder-Flash, del que no se aportan datos en la información disponible.

La innovación técnica relevante en este checkpoint es la preservación de las cabezas de predicción multi-token (`mtp.*`, con `mtp_num_hidden_layers: 1` en `config.json`) en precisión FP16. Estas cabezas auxiliares permiten decodificación especulativa en runtimes compatibles (oMLX, llama.cpp con MTP draft), con una mejora reportada de 1,4x a 1,7x en throughput de tokens. La cuantización oQ4e aplica precisión mixta: las proyecciones de atención críticas (`v_proj`, `q_proj`) y las down-projections de MLP en capas sensibles se elevan a 5 o 6 bits para preservar profundidad de razonamiento y adherencia a la indentación, mientras que el resto se mantiene en 4 bits con calibración estricta mediante matriz de importancia (128 muestras, longitud de secuencia 512). El objetivo de dtype FP16 en los tensores no cuantizados maximiza la velocidad de ejecución en chips M1/M2 y el ancho de banda en M3/M4/M5.

## Capacidades

- Generación de texto y código: el modelo está afinado específicamente para tareas de programación (coder-flash), incluyendo escritura de código, refactorización y finalización en contexto.
- Razonamiento multi-paso: conserva las capacidades de razonamiento del modelo base, reforzadas en las capas sensibles mediante precisión mixta.
- Decodificación especulativa: soporte nativo de MTP con cabezas draft en FP16, activable en oMLX y llama.cpp.
- Integración en agentes de código: diseñado para harnesses de terminal headless como Hermes y OpenCode, y para flujos multi-turno de desarrollo de software.
- Conversacional: pipeline declarado como text-generation y conversational.
- Capacidades multimodales: no disponibles en esta edición (se han eliminado explícitamente los bloques de visión y los procesadores de imagen y vídeo).
- Tool calling / function calling: no se documenta explícitamente en la información disponible.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Agentes de código headless en terminal: el modelo puede servir como motor de un agente CLI (Hermes, OpenCode) que recibe instrucciones en lenguaje natural, inspecciona el repositorio y genera parches. Su footprint de ~13,8 GB permite ejecutarlo localmente en un Mac de 24 GB sin depender de la nube.
- Asistencia de programación en IDE local: integrado mediante MLX-LM u oMLX, puede ofrecer autocompletado y generación de funciones con baja latencia gracias a la decodificación especulativa MTP (1,4x–1,7x de aceleración en tareas de código).
- Refactorización multi-turno de bases de código: la ventana de contexto (no documentada) y el diseño conversacional lo hacen adecuado para sesiones largas de edición guiada, donde el agente mantiene el estado del proyecto entre turnos.
- Generación de tests y documentación técnica: el modelo puede producir suites de pruebas unitarias y docstrings a partir de firmas de funciones y fragmentos existentes, un caso típico de los modelos coder-flash.
- Enseñanza y revisión de código en local: al ejecutarse íntegramente en Apple Silicon sin conexión, es apto para entornos con requisitos de privacidad (código propietario que no puede salir de la máquina).
- Prototipado rápido en Macs de 18 GB: la edición Text-Only reduce el consumo lo suficiente como para caber en equipos de gama de entrada con memoria unificada, permitiendo probar pipelines de agentes antes de escalar a hardware mayor.
- Automatización de tareas de mantenimiento de repositorios: generación de mensajes de commit, resúmenes de diffs y actualizaciones de dependencias dentro de scripts de CI ejecutados en runners macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento aportada por el autor es la aceleración relativa de la decodificación especulativa MTP: aproximadamente 1,4x–1,7x más throughput de tokens en tareas de código y razonamiento agéntico, sin cifras absolutas de tokens por segundo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~13,8 GB de pesos en disco y RAM para la cuantización oQ4e-fp16.
- Equipos objetivo declarados: Apple Silicon con 18 GB, 24 GB y 32 GB de memoria unificada.
- Cabe en GPU de consumo: sí, en el ecosistema Apple (M1, M2, M3, M4 y M5). No está empaquetado para CUDA ni para GPUs NVIDIA; el formato es MLX.
- Aceleración por chip: FP16 en tensores no cuantizados maximiza velocidad en M1/M2 y ancho de banda en M3/M4/M5.
- Opciones de despliegue: oMLX Server (`omlx serve`) y MLX-LM (`mlx_lm.generate`). El autor menciona también llama.cpp con MTP draft para la decodificación especulativa.
- Latencia y throughput: no se proporcionan cifras absolutas; solo el rango relativo de 1,4x–1,7x con MTP activado.
- Configuración recomendada por el autor: `mtp_enabled: true`, `mtp_num_draft_tokens: 3`, `temperature: 0.2`, `top_p: 0.95`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-Text-oQ4e-fp16-mtp (este) | ~27B denso | no disponible | 4-bit oQ4e mixta, FP16 en MTP | Apache-2.0 | MLX / Apple Silicon |
| xunlinkx/Qwopus3.8-27B-Coder-Flash-oQ4e-fp16-mtp | ~27B denso | no disponible | 4-bit oQ4e mixta, FP16 en MTP | Apache-2.0 | MLX / Apple Silicon (incluye visión) |
| Jackrong/Qwopus3.8-27B-Coder-Flash (base) | ~27B denso | no disponible | pesos completos (presumiblemente BF16/FP16) | Apache-2.0 | multiplataforma |

La comparativa se limita a las variantes del mismo modelo base, ya que la información disponible no incluye datos de benchmarks ni especificaciones de modelos alternativos de la misma categoría. No disponible para comparaciones con modelos de otros autores.

## Limitaciones y advertencias

- Solo texto: esta edición elimina deliberadamente las capacidades de visión; no puede procesar imágenes ni vídeo.
- Plataforma restringida: el formato MLX solo se ejecuta en Apple Silicon; no es desplegable en GPUs NVIDIA, AMD ni en CPU convencional sin conversión adicional.
- Idiomas no documentados: no se especifica qué lenguas soporta el modelo base, lo que impide garantizar calidad en castellano u otros idiomas distintos del inglés.
- Contexto no documentado: se desconoce la longitud máxima de contexto, un dato crítico para planificar flujos multi-turno y agentes con repositorios grandes.
- Riesgo de alucinación: como todo LLM de código, puede generar APIs inexistentes, imports incorrectos o fragmentos que compilan pero no cumplen la especificación; requiere validación en CI.
- Sesgos: no se documentan evaluaciones de sesgo del modelo base ni de la cuantización.
- Efecto de la cuantización: aunque las capas sensibles se elevan a 5/6 bits, la cuantización a 4 bits puede degradar ligeramente la precisión en razonamiento profundo y en tareas de matemáticas simbólicas frente al checkpoint original.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Jackrong/Qwopus3.8-27B-Coder-Flash y de los datos de entrenamiento originales.
- Madurez: el repositorio tiene 264 descargas, 0 likes y fue creado y actualizado en la misma fecha (2026-11-02), lo que indica un artefacto reciente y con poca validación comunitaria.
- MTP dependiente del runtime: la aceleración especulativa solo se aprovecha en oMLX y llama.cpp con soporte MTP draft; en otros runtimes se pierde la ventaja de throughput.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/xunlinkx/Qwopus3.8-27B-Coder-Flash-Text-oQ4e-fp16-mtp
- Variante con visión: https://huggingface.co/xunlinkx/Qwopus3.8-27B-Coder-Flash-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
