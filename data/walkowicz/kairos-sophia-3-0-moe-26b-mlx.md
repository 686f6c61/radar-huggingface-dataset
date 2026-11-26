# Walkowicz/kairos-sophia-3.0-moe-26b-mlx

## Resumen

Kairos Sophia 3.0 MoE 26B (MLX Edition) es una distribucion nativa para Apple Silicon del modelo multimodal Kairos Sophia 3.0 MoE 26B, un fine-tune de `thinkingmachines/Inkling-2-Mini` orientado a modernizacion de codigo legacy, tool calling y tareas de vision-lenguaje. Lo publica el usuario Walkowicz bajo licencia Apache 2.0 y se distribuye exclusivamente en formato MLX, con variantes de 5 bits, 8 bits y bf16, pensadas para ejecutarse sobre la pila `mlx-vlm` en chips de la serie M de Apple.

El modelo conserva el backbone de lenguaje MoE de 26.000 millones de parametros del modelo base (arquitectura `inkling2_loop`) y anade una torre de vision multimodal de 422 tensores, lo que le permite procesar entradas de imagen y texto. Su especializacion declarada por el autor se centra en migracion de COBOL a Java/Quarkus, generacion de frontend y flujos de tool calling, con soporte nativo de ingles y portugues de Brasil.

Es relevante porque ofrece una via practica para ejecutar un modelo multimodal de 26B en hardware de consumo Apple (desde 24 GB de memoria unificada en la variante de 5 bits), algo poco habitual en modelos de este tamano, y porque cubre un nicho concreto de modernizacion de sistemas legacy que rara vez se aborda en modelos generalistas. Existe una edicion paralela en GGUF/CUDA/Ollama publicada por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (`inkling2_loop`) con torre de vision de 422 tensores |
| Parametros totales | 26B (aproximado, segun nombre del modelo; no se detalla el desglose exacto) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits (5.643 bpw, group size 64), 8 bits (8.604 bpw, group size 64), bf16 |
| Idiomas soportados | Ingles (en), portugues de Brasil (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (subcarpetas `5bit/`, `8bit/`, `bf16/`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `thinkingmachines/Inkling-2-Mini`, cuya arquitectura interna se identifica como `inkling2_loop`. Se trata de un transformer con mezcla de expertos (MoE) de aproximadamente 26.000 millones de parametros, al que se anade una torre de vision multimodal compuesta por 422 tensores, lo que habilita la modalidad image-text-to-text. La distribucion MLX preserva tanto el backbone de lenguaje como la torre de vision en las tres precisiones ofrecidas.

No se han publicado en la informacion disponible detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas del fine-tune (como decodificacion especulativa o mecanismos de atencion alternativa). El autor no documenta el proceso de entrenamiento mas alla de la referencia al modelo base y a las capacidades objetivo (modernizacion de codigo legacy, tool calling, frontend).

## Capacidades

- Generacion de texto y razonamiento general sobre el backbone MoE de 26B.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text).
- Generacion y transformacion de codigo, con enfasis en modernizacion de sistemas legacy: migracion de COBOL a Java/Quarkus (Jakarta EE), conversion de tipos como `PIC S9(13)V99 COMP-3` a `BigDecimal` con `RoundingMode.HALF_EVEN`.
- Generacion de codigo frontend.
- Soporte de tool calling / function calling, segun las etiquetas del autor.
- Capacidades multilingues limitadas a ingles y portugues de Brasil.
- No se documentan modos de razonamiento extendido (thinking mode), audio ni otras modalidades adicionales.

## Casos de uso

- Modernizacion de COBOL a Java/Quarkus: el modelo puede recibir fragmentos de copybooks o programas COBOL y generar equivalentes en Jakarta EE con tipos `BigDecimal` y redondeo controlado, lo que encaja con su especializacion declarada y evita traducciones manuales propensas a errores en tipos decimales.
- Migracion de logica de negocio legacy a servicios Quarkus 3.15+: se usaria para transformar rutinas y validaciones de sistemas antiguos en endpoints y servicios modernos, aprovechando el conocimiento del modelo sobre el stack Jakarta EE.
- Generacion de interfaces frontend a partir de especificaciones o capturas: al ser multimodal, puede recibir una imagen de referencia o un mockup y producir codigo de interfaz, util en equipos que reconstruyen pantallas de aplicaciones antiguas.
- Asistente de refactorizacion en IDE sobre Apple Silicon: integrable en un flujo local con `mlx-vlm` para sugerir refactorizaciones y conversiones de tipos mientras el desarrollador trabaja, sin enviar codigo propietario a la nube.
- Automatizacion con tool calling: puede orquestar llamadas a funciones en pipelines de CI/CD, por ejemplo para lanzar tareas de compilacion, consultar repositorios o validar resultados de tests.
- Atencion tecnica en portugues de Brasil e ingles: al tener soporte nativo de pt-BR, sirve para documentar o explicar cambios de codigo a equipos lusohablantes, un caso frecuente en proyectos de modernizacion en Brasil.
- Procesamiento de documentacion tecnica con imagenes: diagramas de arquitectura o capturas de pantalla de sistemas legacy pueden analizarse junto a texto para generar planes de migracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM equivalente segun variante (memoria unificada en Apple Silicon): 18,64 GB para 5 bits, 28,40 GB para 8 bits y aproximadamente 52,78 GB para bf16.
- Memoria unificada recomendada por el autor: 24-32 GB (M2/M3/M4 Pro) para 5 bits; 36-48 GB (M3/M4 Max) para 8 bits; 64-96 GB o mas (M2/M3/M4 Ultra) para bf16.
- Solo se distribuye en formato MLX, por lo que requiere hardware Apple Silicon; no es ejecutable directamente en GPU NVIDIA o AMD con esta version. Para CUDA/GGUF/Ollama existe la edicion paralela `Walkowicz/kairos-sophia-3.0-moe-26b`.
- Despliegue mediante `mlx-vlm` (comando `python -m mlx_vlm.generate`). No se documenta soporte para vLLM, TGI o llama.cpp en esta distribucion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kairos Sophia 3.0 MoE 26B (MLX) | 26B (MoE) | no disponible | Imagen + texto | Apache 2.0 | MLX (Apple Silicon) y edicion GGUF/CUDA |
| thinkingmachines/Inkling-2-Mini (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas multimodales de ~26B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validacion de la comunidad ni evidencia publica de calidad.
- Solo soporta ingles y portugues de Brasil; no se declara castellano ni otros idiomas.
- La longitud de contexto no esta documentada, lo que impide planificar casos de uso con ventanas largas.
- Riesgo de alucinacion en generacion de codigo: las conversiones de tipos COBOL a Java deben revisarse y testearse, especialmente en logica decimal y de redondeo.
- Restriccion de plataforma: la version MLX solo se ejecuta en Apple Silicon; para otros entornos hay que acudir a la edicion GGUF/CUDA.
- No se documentan sesgos conocidos, evaluaciones de seguridad ni detalles del dataset de entrenamiento, lo que dificulta auditar el modelo para produccion.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base `thinkingmachines/Inkling-2-Mini` antes de un uso comercial.
- El repositorio ocupa 99,8 GB, lo que exige espacio de almacenamiento considerable para descargar todas las variantes.

## Enlaces

- Hugging Face (MLX): https://huggingface.co/Walkowicz/kairos-sophia-3.0-moe-26b-mlx
- Edicion GGUF / CUDA / Ollama: https://huggingface.co/Walkowicz/kairos-sophia-3.0-moe-26b
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Libreria mlx-vlm: https://github.com/Blaizzy/mlx-vlm
