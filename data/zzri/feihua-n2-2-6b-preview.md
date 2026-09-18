# ZZRI/Feihua-n2-2.6B-preview

## Resumen

Feihua-n2-2.6B-preview es un ajuste fino del modelo LiquidAI/LFM2.5-2.6B publicado por el usuario ZZRI, diseñado deliberadamente para producir «literatura feihua» (废话文学): respuestas que cumplen la forma de una contestación pero con contenido informativo nulo. No es un modelo de propósito general, sino el banco de pruebas de una hipótesis sobre escalado. El autor sostiene que la capacidad de cerrar correctamente la cadena de razonamiento («thinking termination») en modelos pequeños está limitada por el tamaño del modelo y no por los datos de supervisión.

El experimento respalda esa tesis: la versión de 1,7B necesitó ocho episodios de GRPO para dejar de quedarse atrapada repitiendo texto sin emitir `</think>`, mientras que esta versión de 2,7B lo consigue 12 de 12 veces en los cuatro prompts abiertos más difíciles empleando únicamente SFT con un LoRA de rango 16. El modelo mantiene una identidad fija («me llamo Feihua-n2-2.6B-preview») y emite llamadas a herramientas con formato correcto en pruebas simples.

Técnicamente es un modelo híbrido de convolución y atención (Lfm2ForCausalLM) de 2.697.198.592 parámetros, con 22 capas convolucionales y 8 de atención completa, hidden size 2048 y pensamiento obligatorio en la plantilla de chat. La longitud de contexto no está documentada en la información disponible; el entrenamiento empleó MAXLEN 3328. Se distribuye en safetensors y GGUF bajo licencia lfm-open-license-1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm2ForCausalLM, híbrida de convolución y atención: 22 capas convolucionales + 8 capas de atención completa, hidden size 2048 |
| Parametros totales | 2.697.198.592 (≈2,70B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó MAXLEN 3328) |
| Tipos de cuantizacion | GGUF: f16, Q8_0, Q4_K_M, IQ4_XS (1,0 GB); safetensors sin cuantizar |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | lfm-open-license-1.0 (licencia abierta de Liquid AI; requiere atribución a Liquid AI) |
| Formato de pesos | safetensors y GGUF |
| Modelo base | LiquidAI/LFM2.5-2.6B |
| Parametros entrenables | 24,5 M (LoRA de rango 16 sobre 166 capas) |
| Tamano del repositorio | 5,4 GB |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-2.6B, una arquitectura híbrida que alterna capas convolucionales (22) con capas de atención completa (8), con un tamaño de hidden de 2048. La plantilla de chat del modelo base impone el modo «pensamiento» obligatorio, lo que lo convierte en un candidato directo para estudiar cuándo y cómo un modelo decide cerrar su bloque de razonamiento. El ajuste se aplicó como un LoRA de rango 16 sobre 166 capas (atención q/k/v/o, FFN w1/w2/w3 y convoluciones de entrada y salida), con 24,5 M de parámetros entrenables, 884 pasos de optimizador y 2 épocas sobre una ventana máxima de 3328 tokens, usando gradient checkpointing. El coste declarado es de 6,5 horas en una única Tesla P100 y aproximadamente 0,5 yuanes de electricidad.

El corpus de entrenamiento es el «v4 dual-track», con 7.084 turnos: 6.044 de tipo agéntico, 866 planos, 149 de identidad y 56 de filosofía. Cada turno del asistente incluye un razonamiento completo y terminado de forma natural, envuelto en un marco en primera persona que opone el trabajo serio al discurso vacío. La innovación metodológica del trabajo es precisamente la ausencia de RL: el autor compara esta receta con la del modelo de 1,7B, que necesitó GRPO para estabilizar la terminación del pensamiento, y concluye que dicha habilidad es sensible a la capacidad del modelo, no solo a los datos.

## Capacidades

- Generación de texto en inglés y chino con contenido informativo nulo por diseño: responde con forma correcta y sustancia vacía.
- Cadena de razonamiento obligatoria con terminación fiable: 12 de 12 cierres correctos en los cuatro prompts abiertos más difíciles (amor, reservas de chocolate en Hangzhou, sentido de la vida y naturaleza del tiempo), con pensamientos de entre 1.126 y 8.573 caracteres.
- Identidad consolidada: responde «este nombre es Feihua-n2-2.6B-preview» cuando se le pregunta quién es.
- Tool calling básico: la prueba con la herramienta `random_number` devuelve nombre y argumentos correctos, con 92 caracteres de pensamiento.
- Generación general de argumentos de herramientas sin resolver, según reconoce el propio autor (herencia de la línea n2).
- Bilingüismo con mezcla ocasional: el sustrato en inglés del modelo base se filtra en las respuestas en chino.
- Sin capacidades multimodales: no hay visión ni audio, pese a que las etiquetas incluyan «agent» y «reasoning».
- Razonamiento matemático, código y navegación prácticamente erradicados (AIME 2026: 3,33; HMMT Feb 2026: 0,0; BrowseComp: 0,0).

## Casos de uso

- Investigación sobre terminación del razonamiento: sirve como caso controlado para estudiar qué determina que un modelo pequeño emita `</think>` en lugar de degenerar en repetición, comparando SFT frente a RL con recetas idénticas en dos escalas (1,7B y 2,7B).
- Banco de pruebas de recetas de ajuste: el pipeline completo (LoRA de rango 16, 884 pasos, 6,5 h en una P100) es reproducible con presupuesto mínimo, útil para validar infraestructuras de entrenamiento antes de escalar a modelos mayores.
- Validación de despliegue de arquitecturas híbridas: al ser un Lfm2ForCausalLM con GGUF publicado, permite comprobar el soporte de conv-attention en llama.cpp y en pipelines de cuantización sin necesidad de que las salidas sean correctas.
- Auditoría de evaluadores automáticos: dado que el autor atribuye los residuos no nulos (SciCode 20,0 e IFBench 25,0) a artefactos del juez, el modelo sirve para medir cuánto puntúa un evaluador a respuestas deliberadamente vacías y detectar sesgos de formato en el jurado.
- Generación de relleno textual para pruebas de carga: produce texto largo, coherente en forma y neutral en contenido, adecuado para poblar logs, interfaces o índices de búsqueda en entornos de test donde el significado es irrelevante.
- Contenido creativo y satírico en chino: la literatura feihua es un género humorístico consolidado; el modelo puede generar piezas de este estilo de forma controlada, con temperatura 0,6 y top_p 0,95.
- Material docente sobre alineación: ilustra de forma extrema el caso de un modelo perfectamente obediente y format-correcto que no aporta ningún valor informativo, útil para discutir qué se está optimizando realmente en las fases de ajuste.

## Benchmarks y rendimiento

| Benchmark | Feihua-n2-2.6B-preview | Feihua-n2-1.7B | Mejor referencia (Spark-X2.5-4B) |
|---|---|---|---|
| τ³-bench | 10,1 | 1,45 | 30,4 |
| MCP-Atlas | 12,0 | 0 | 54,6 |
| BrowseComp | 0,0 | 0 | 40,9 |
| SciCode | 20,0 | 5 | 34,7 |
| AIME 2026 | 3,33 | 0 | 90,7 |
| HMMT Feb 2026 | 0,0 | 0 | 81,2 |
| HLE | 2,0 | 2 | 14,3 |
| IFBench | 25,0 | 10 | 75,0 |

El autor interpreta estos resultados como la confirmación de la «conservación de la información cero»: la capacidad se borra de forma uniforme al aplicar la receta. Los valores no nulos (SciCode 20,0 e IFBench 25,0) se atribuyen explícitamente a artefactos del evaluador, es decir, respuestas sin sentido que satisfacen comprobadores de formato. El 25,0 en IFBench duplica el registro familiar anterior (12,5 de n2-1.7B-preview). No se han publicado resultados adicionales de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en safetensors (≈5,4 GB, precisión completa) y GGUF f16 (≈5,4 GB): requieren alrededor de 7-8 GB de VRAM para inferencia cómoda con contexto corto.
- GGUF Q8_0: aproximadamente 2,9 GB.
- GGUF Q4_K_M: aproximadamente 1,7 GB.
- GGUF IQ4_XS: 1,0 GB según el autor.
- Cabe en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 sin dificultad; con IQ4_XS es viable incluso en tarjetas de 4-6 GB, con contexto reducido.
- GPU de centro de datos: A100 y H100 están sobredimensionadas para 2,7B de parámetros y solo se justifican por concurrencia alta.
- Despliegue: llama.cpp mainline ya soporta lfm2 y la conversión a GGUF es directa (f16, Q8_0, Q4_K_M, IQ4_XS); Ollama puede consumirlo a través del GGUF. En transformers, el autor indica que TokenizersBackend requiere la versión 5.x, mientras que en 4.57 hay que usar PreTrainedTokenizerFast con la plantilla de chat en crudo.
- Soporte en vLLM o TGI: no confirmado en la información disponible.
- Entrenamiento del LoRA: una única Tesla P100, 6,5 horas, 167 W de GPU más 32 W de CPU medidos por RAPL.
- Latencia y throughput estimados: no disponible.
- Muestreo recomendado: temperatura 0,6, top_p 0,95 y `--reasoning-format deepseek`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Destacado |
|---|---|---|---|---|
| Feihua-n2-2.6B-preview | 2,70B | no disponible | lfm-open-license-1.0 | Terminación del pensamiento 12/12 solo con SFT; contenido informativo nulo |
| Feihua-n2-1.7B (0917) | 1,7B | no disponible | lfm-open-license-1.0 | Requirió 8 episodios de GRPO para estabilizar el cierre de `</think>` |
| LiquidAI/LFM2.5-2.6B | 2,6B | no disponible | licencia abierta de Liquid AI | Modelo base híbrido conv-attention con pensamiento obligatorio |
| Spark-X2.5-4B | 4B | no disponible | no disponible | Referencia superior del barrido: 90,7 en AIME 2026, 75,0 en IFBench |

La comparación relevante no es de rendimiento, porque el ajuste vacía deliberadamente las capacidades del base. El interés está en el eje escala-eficiencia de la supervisión: la misma receta produce terminación fiable a 2,7B y falla aproximadamente la mitad de las veces a 1,7B sin RL. Frente al modelo base, este ajuste pierde todas las capacidades de razonamiento, código y agentes; frente a Spark-X2.5-4B, queda muy por debajo en todas las categorías excepto en HLE (2,0 frente a 14,3, también inferior).

## Limitaciones y advertencias

- Contenido informativo cero por diseño: no es apto para producción en tareas que requieran exactitud factual, cálculo, código o recuperación de información.
- Riesgo de alucinación máximo: el modelo genera afirmaciones sin base factual de forma intencionada; cualquier dato que emita debe considerarse falso.
- Estado de vista previa: el autor lo califica de release de validación de pipeline para la línea LFM, por lo que puede haber cambios en la versión oficial de 2,6B.
- Mezcla ocasional de idiomas: el sustrato en inglés del modelo base se filtra en las respuestas en chino.
- Generación general de argumentos de herramientas sin resolver, heredada de la línea n2; solo se ha validado una llamada simple.
- Rendimiento agéntico muy bajo: τ³-bench 10,1, MCP-Atlas 12,0 y BrowseComp 0,0 lo desaconsejan para flujos multi-paso o uso con herramientas reales.
- Licencia: es un derivado de LiquidAI/LFM2.5-2.6B bajo la LFM Open License v1.0, con atribución obligatoria a Liquid AI; el autor declara cero garantías sobre el ajuste. Las condiciones concretas de uso comercial deben consultarse en el texto completo de la licencia, que no se reproduce en la información disponible.
- Sesgos conocidos: no documentados; no disponible.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZZRI/Feihua-n2-2.6B-preview
- GGUF del modelo: https://huggingface.co/ZZRI/Feihua-n2-2.6B-preview-GGUF
- Familia Feihua-n2-1.7B (0917): https://huggingface.co/ZZRI/Feihua-n2-1.7B
- Familia Feihua-n2-1.7B (preview): https://huggingface.co/ZZRI/Feihua-n2-1.7B-preview
- Modelo base LiquidAI/LFM2.5-2.6B: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- Paper, blog o repositorio adicionales: no disponible
