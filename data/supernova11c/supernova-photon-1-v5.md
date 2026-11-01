# Supernova11c/Supernova-Photon-1-V5

## Resumen

Supernova-Photon-1-V5 es un componente de resolución de ecuaciones matemáticas y científicas publicado por el desarrollador Supernova11c bajo el paraguas del proyecto Supernova TeraiLLM Photon-1. A pesar de estar etiquetado como `moe` en HuggingFace y de presentarse como "modelo", la propia model card aclara que no es un modelo de lenguaje: no genera texto, no tiene modelos preentrenados y su núcleo aritmético es una implementación exacta en Python. El checkpoint almacena únicamente metadatos y un parámetro entrenable de calibración escalar.

El alcance funcional es muy acotado: resuelve seis ecuaciones físicas clásicas (Einstein, velocidad, densidad, Newton, trabajo y potencia) en 18 direcciones de despeje, con selección automática de ecuación, reconocimiento de variables, conversión de unidades SI y validación de compatibilidad. Su relevancia actual es limitada para el ecosistema de IA open source, ya que se trata más de una utilidad determinista empaquetada como artefacto tipo modelo que de un sistema neuronal.

El repositorio tiene un tamaño de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y la licencia es propietaria (`supernova-horizon`), lo que condiciona cualquier uso comercial o redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resolutor multi-ecuación (6 ecuaciones, 18 direcciones); núcleo aritmético en Python, no red neuronal |
| Parametros totales | 1 parámetro entrenable (componente de calibración escalar) |
| Parametros activos | no disponible (la etiqueta `moe` no se corresponde con una arquitectura Mixture-of-Experts real) |
| Longitud de contexto | no disponible (no aplica; no hay generación de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch de calibración, no pesos de red) |
| Idiomas soportados | en |
| Licencia | supernova-horizon (propietaria, `license: other`) |
| Formato de pesos | PyTorch checkpoint (`photon1_v5.pt`) + `config.json` |

## Arquitectura y entrenamiento

No se trata de un transformer, MoE, SSM ni arquitectura híbrida. Según la model card, Photon-1 V5 utiliza "an exact Python mathematical core": la aritmética la ejecuta una implementación en Python y el checkpoint únicamente guarda metadatos y la calibración escalar. El único parámetro entrenable pertenece al componente de calibración escalar, y no se declaran modelos preentrenados ni datos de entrenamiento en tokens.

La etiqueta `moe` presente en los tags de HuggingFace no está respaldada por la documentación del autor, que describe un sistema determinista de resolución de ecuaciones. No se documenta RLHF, DPO, decodificación especulativa ni ninguna innovación de atención. Las cifras de "benchmarks de desarrollo" que reporta el autor (18.000/18.000 en direccionamiento, 11/11 en entradas inválidas, 6/6 en conversión de unidades, 7/7 en pruebas funcionales) son, en palabras del propio autor, benchmarks sintéticos de desarrollo y no una certificación científica independiente.

## Capacidades

- Resolución de seis ecuaciones físicas: Einstein (E = mc²), velocidad (v = d/t), densidad (ρ = m/V), Newton (F = ma), trabajo (W = Fd) y potencia (P = W/t).
- Despeje en 18 direcciones (tres por ecuación).
- Selección automática de ecuación a partir de los datos de entrada.
- Reconocimiento de variables.
- Conversión de unidades SI.
- Validación de compatibilidad de unidades.
- Rechazo de entradas inválidas.
- Comprobación de consistencia numérica.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso general ni capacidades multilingües (solo inglés).

## Casos de uso

- Cálculo de energía relativista en ejercicios docentes: dada una masa y una velocidad, el modelo despeja E en julios aplicando E = mc² con conversión automática de unidades, útil en material educativo de física.
- Verificación de cálculos de cinemática: a partir de distancia y tiempo, obtiene velocidad con validación de compatibilidad de unidades, adecuado para corregir automáticamente ejercicios.
- Cálculo de densidad en laboratorio: con masa y volumen en unidades SI, devuelve ρ y rechaza entradas con unidades incompatibles, útil en scripts de prácticas.
- Resolución de problemas de dinámica: dada masa y aceleración, calcula fuerza mediante F = ma, apropiado para cuadernos de ejercicios interactivos.
- Cálculo de trabajo y potencia en problemas de mecánica: encadena W = Fd y P = W/t con conversión de unidades, útil en herramientas de autoaprendizaje.
- Validación determinista en pipelines de datos científicos: al ser aritmética exacta en Python, puede usarse como comprobador de resultados en flujos donde se requiere reproducibilidad estricta y no tolerancia a alucinaciones.

## Benchmarks y rendimiento

| Benchmark (desarrollo, reportado por el autor) | Resultado |
|---|---|
| Direction benchmark | 18.000/18.000 |
| Automatic routing | 18.000/18.000 |
| Invalid-input tests | 11/11 |
| Unit conversion tests | 6/6 |
| Functional tests | 7/7 |
| Error relativo medio reportado | 8,57e-16 % |

El autor advierte explícitamente que son benchmarks sintéticos de desarrollo, no una certificación científica independiente. No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: no disponible; el checkpoint contiene metadatos y calibración, no pesos de red, por lo que la inferencia no requiere GPU.
- GPU recomendadas: no aplica; el cálculo se ejecuta en CPU mediante Python.
- Cabe en cualquier equipo con Python y PyTorch instalados (dependencias en `requirements.txt`).
- Opciones de despliegue: ejecución directa del checkpoint PyTorch con el código del autor; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; al ser aritmética determinista, la latencia depende del intérprete Python y no de aceleración por hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supernova-Photon-1-V5 | Resolutor de ecuaciones en Python | 1 (calibración) | no aplica | supernova-horizon (propietaria) | HuggingFace |
| SymPy | Librería simbólica en Python | no aplica | no aplica | BSD | PyPI |
| Wolfram Alpha API | Servicio de cálculo | no aplica | no aplica | propietaria | API comercial |
| Modelos LLM con razonamiento matemático (p. ej., series tipo Qwen-Math) | Red neuronal | miles de millones | miles de tokens | variable | HuggingFace |

No se dispone de comparaciones publicadas por el autor con alternativas. La comparación anterior es orientativa por categoría funcional, no por rendimiento medido.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona de forma general y no soporta tool calling ni agentes.
- Alcance restringido a seis ecuaciones físicas y 18 direcciones de despeje.
- La etiqueta `moe` de HuggingFace no se corresponde con la arquitectura descrita por el autor; conviene no asumir capacidades de Mixture-of-Experts.
- Solo soporta inglés como idioma declarado.
- Licencia propietaria `supernova-horizon`: es necesario revisar el archivo `LICENSE` antes de cualquier uso comercial o redistribución.
- Los benchmarks reportados son sintéticos y de desarrollo, no validación independiente.
- Repositorio con cero descargas y cero likes: sin comunidad ni soporte contrastado.
- Riesgo de confusión en producción si se integra como si fuera un LLM; su naturaleza determinista exige integrarlo como utilidad aritmética, no como generador.

## Enlaces

- HuggingFace: https://huggingface.co/Supernova11c/Supernova-Photon-1-V5
- Licencia (referenciada en la model card): LICENSE del repositorio
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
