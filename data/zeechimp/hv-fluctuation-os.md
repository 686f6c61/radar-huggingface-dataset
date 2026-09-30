# zeechimp/hv-fluctuation-os

## Resumen

hv-fluctuation-os es un motor de simulación numérica publicado en HuggingFace por el usuario zeechimp bajo la etiqueta de pipeline `feature-extraction`, aunque no se trata de una red neuronal ni de un modelo con pesos entrenados: es una librería de Python de aproximadamente 22 KB de código fuente que implementa la igualdad de Jarzynski (1997) y el teorema de fluctuación de Crooks (1999) aplicados a dinámica de Langevin en sistemas canónicos de juguete. Su única dependencia es NumPy y no requiere GPU.

El paquete resuelve un problema concreto de la física estadística computacional: estimar la diferencia de energía libre de equilibrio ΔF entre dos valores de un parámetro de control λ a partir de trayectorias de no equilibrio. Para ello integra la ecuación de Langevin con el esquema Euler–Maruyama, muestrea condiciones iniciales de la distribución de Boltzmann y ofrece estimadores de ΔF tanto por promedio exponencial de Jarzynski (naive y con corrección de sesgo) como por ajuste del logaritmo del cociente de distribuciones de trabajo de Crooks.

Es relevante como herramienta didáctica y de validación: es autocontenido, reproducible (los 17 controles de consistencia incluidos pasan) y ejecuta el benchmark completo en unos 40 segundos en CPU. Está dirigido a investigadores y docentes que necesitan comprobar estimadores de energía libre sin montar un entorno de simulación molecular completo. La ficha del repositorio registra 0 descargas y 1 like en el momento de la consulta, y la documentación está únicamente en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es una red neuronal. Motor numérico de simulación: dinámica de Langevin integrada con Euler–Maruyama y estimadores de energía libre (Jarzynski, Crooks) |
| Parámetros totales | No aplicable (no contiene pesos entrenados) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable |
| Tipos de cuantización | No aplicable (código Python puro, sin pesos que cuantizar) |
| Idiomas soportados | Inglés (en), según la etiqueta del repositorio y el idioma de la documentación |
| Licencia | MIT |
| Formato de pesos | No disponible (no hay pesos; se distribuye como código fuente Python, ~22 KB) |
| Dependencias | NumPy (única dependencia declarada) |
| Tiempo de ejecución del benchmark | ~40 s en CPU para el benchmark completo |
| Sistemas incluidos | MovingHarmonicTrap, TunableQuadratic, DoubleWellTilted |
| Componentes de la API | System, LinearSchedule, SinusoidalSchedule, sample_equilibrium, sample_forward, sample_forward_both, jarzynski_estimate, crooks_test |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creación / actualización | 2026-09-30 / 2026-09-30 |

## Arquitectura y entrenamiento

No existe entrenamiento. El paquete es un motor de simulación escrito exclusivamente con NumPy que resuelve numéricamente la dinámica de Langevin de un sistema con potencial U(x, λ), donde λ es un parámetro de control externo. La clase `System` define el potencial, la fuerza, la derivada ∂U/∂λ y la energía libre; `LinearSchedule` y `SinusoidalSchedule` definen la trayectoria temporal de λ en el intervalo [0, T]. El integrador es explícito de tipo Euler–Maruyama con paso `dt` configurable (los ejemplos usan `dt=1e-3` y `n_steps=5000`).

El flujo de trabajo típico tiene tres etapas: `sample_equilibrium` genera condiciones iniciales desde la distribución de Boltzmann para el valor inicial de λ; `sample_forward` (o `sample_forward_both`, que añade la rama inversa en una sola llamada) arrastra el sistema y devuelve el trabajo W por trayectoria; y `jarzynski_estimate` o `crooks_test` convierten ese conjunto de trabajos en una estimación de ΔF. `jarzynski_estimate` devuelve tanto la estimación naive del promedio exponencial como una versión con corrección de sesgo, y `crooks_test` ajusta log P_F(W) − log P_R(−W) frente a W y extrae la pendiente y el corte (de donde sale ΔF).

La innovación práctica no está en el algoritmo —ambos teoremas son clásicos— sino en la genericidad: cualquier potencial con un parámetro de control ajustable puede conectarse al motor implementando la interfaz `System`. El repositorio incluye tres sistemas de referencia con solución analítica conocida (trampa armónica móvil con ΔF = 0 exacto, cuadrática ajustable con ΔF = ln(4)/2 y pozo doble inclinado con barrera) y una batería de 17 comprobaciones de consistencia que, según la model card, pasan en su totalidad.

## Capacidades

- Simulación de trayectorias de no equilibrio mediante dinámica de Langevin con integración Euler–Maruyama y paso temporal configurable.
- Muestreo de equilibrio desde la distribución de Boltzmann para el valor inicial del parámetro de control.
- Estimación de ΔF por la igualdad de Jarzynski, en variante naive y con corrección de sesgo.
- Contraste del teorema de Crooks: ajuste lineal de log P_F(W) − log P_R(−W) frente a W, devolviendo pendiente y ΔF por el corte.
- Cálculo conjunto de ramas directa e inversa en una única llamada con `sample_forward_both`.
- Soporte de sistemas personalizados: cualquier potencial U(x, λ) que implemente la interfaz `System` puede acoplarse al motor.
- Dos programaciones temporales de λ incluidas: lineal y sinusoidal (medio período).
- Verificación automática de consistencia: 17 comprobaciones internas.
- No dispone de generación de texto, razonamiento, código, matemáticas simbólicas, visión, audio, tool calling, function calling ni capacidades de agente. No es un modelo de lenguaje ni multimodal.

## Casos de uso

- Docencia de termodinámica de no equilibrio: permite a los estudiantes reproducir en un portátil, en menos de un minuto, la verificación numérica de Jarzynski y Crooks sobre sistemas con solución analítica conocida, comparando la estimación con el valor exacto.
- Validación de estimadores de energía libre: sirve como banco de pruebas controlado para comprobar que una implementación propia de un estimador reproduce valores de referencia (por ejemplo, βΔF ≈ −0,021 en la trampa armónica con 10.000 trayectorias, frente al valor exacto 0).
- Estudio del sesgo a número bajo de trayectorias: el repositorio documenta la convergencia con 10 semillas (std de 0,038 con 100 trayectorias frente a 0,002 con 10.000), lo que permite analizar cómo se comporta el promedio exponencial cuando hay pocas muestras.
- Prototipado de experimentos de pinzas ópticas o de partícula única: el sistema `MovingHarmonicTrap` reproduce la geometría típica de estos experimentos, por lo que puede usarse para planificar el número de tiradas y la duración del protocolo antes de ir al laboratorio.
- Pruebas de integradores y de programaciones temporales de λ: la combinación de `LinearSchedule`, `SinusoidalSchedule` y paso `dt` configurable permite medir el error de discretización de Euler–Maruyama y su efecto sobre ΔF.
- Integración en pipelines de investigación reproducibles: al depender solo de NumPy y no necesitar GPU, puede ejecutarse dentro de un contenedor de CI para verificar que una modificación del código no rompe los 17 controles de consistencia.
- Estudio de cruce de barreras: el sistema `DoubleWellTilted` (λ de 0,0 a 1,5) genera distribuciones de trabajo anchas (σ_W ≈ 2,3) con eventos raros de bajo W, útil para analizar la contribución dominante en el promedio exponencial.
- Desarrollo de nuevos potenciales: actuaría como plantilla para conectar un potencial propio e integrarlo en el mismo flujo de muestreo y estimación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de aprendizaje automático (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, dado que el paquete no es un modelo entrenado. Los resultados numéricos que sí se documentan son los de validación física interna.

Trampa armónica (ΔF = 0 exacto; trabajo íntegramente disipativo, con ⟨W⟩ = 0,64 y σ_W = 1,14):

| n_traj | βΔF naive | βΔF con corrección de sesgo |
|---|---|---|
| 100 | +0,114 | +0,121 |
| 500 | −0,153 | −0,149 |
| 2000 | −0,074 | −0,073 |
| 10000 | −0,021 | −0,021 |

Cuadrática ajustable (ΔF = ln(4)/2 ≈ 0,6931):

| n_traj | βΔF naive | ⟨W⟩ | Exacto |
|---|---|---|---|
| 100 | +0,676 | 0,733 | 0,693 |
| 1000 | +0,717 | 0,781 | 0,693 |
| 10000 | +0,696 | 0,759 | 0,693 |

Contraste de Crooks (5.000 trayectorias directas y 5.000 inversas):

| Magnitud | Ajuste | Exacto |
|---|---|---|
| Pendiente | +0,911 | +1,000 |
| ΔF por el corte | +0,658 | +0,693 |

El error absoluto en ΔF es de 0,036 y el ajuste lineal presenta R² = 0,82.

Escalado de la convergencia (desviación estándar sobre 10 semillas, comparada con 1/√N):

| n_traj | std observada | 1/√N |
|---|---|---|
| 100 | 0,038 | 0,100 |
| 500 | 0,013 | 0,045 |
| 2000 | 0,008 | 0,022 |
| 10000 | 0,002 | 0,010 |

La model card indica que la decadencia observada se aproxima a 1/N en el régimen de n grande.

Pozo doble inclinado (λ de 0,0 a 1,5, cruce de barrera):

| n_traj | βΔF naive | ⟨W⟩ | σ_W | ΔF exacto |
|---|---|---|---|---|
| 200 | −2,326 | −0,920 | 2,29 | −2,290 |
| 1000 | −2,296 | −0,897 | 2,27 | −2,290 |
| 5000 | −2,306 | −0,881 | 2,30 | −2,290 |

En este caso el estimador naive recupera ΔF con un error del 0,7 %. El repositorio declara 17 de 17 controles de consistencia superados.

## Requisitos de hardware

- VRAM: no aplicable. El motor es exclusivamente NumPy y no utiliza GPU.
- GPU recomendadas: ninguna. No hay soporte para CUDA, ROCm ni Metal.
- CPU: cualquier procesador capaz de ejecutar NumPy; el benchmark completo tarda aproximadamente 40 segundos en CPU según la model card.
- Memoria RAM: no se especifica un requisito, pero el tamaño del paquete (~22 KB de código) y el hecho de trabajar con trayectorias unidimensionales sugieren un consumo muy reducido. La memoria escala con `n_traj`, `n_steps` y el número de semillas, parámetros configurables por el usuario.
- Latencia y throughput: no se publican cifras desglosadas por trayectoria; el único dato disponible es el tiempo total del benchmark (~40 s). El coste crece de forma aproximadamente lineal con `n_traj × n_steps`.
- Opciones de despliegue: instalación como paquete Python con NumPy en el entorno (`venv`, `conda`, contenedor Docker). No aplican vLLM, llama.cpp, Ollama ni TGI, al no existir pesos ni inferencia de red neuronal.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El artefacto no es un modelo de lenguaje ni de visión, por lo que las comparativas habituales por parámetros, contexto o licencia no son aplicables. Los resultados de búsqueda web recibidos (una nota sobre el modelo ZEE de Archer Aviation, un enlace genérico a HuggingFace, una entrada de arXiv y el sitio fluctuation.ai) no corresponden a herramientas equivalentes de simulación de teoremas de fluctuación y no permiten establecer una comparación verificable.

Una comparación relevante tendría que hacerse contra otras librerías de dinámica estocástica y estimación de energía libre (por ejemplo, entornos de dinámica molecular o paquetes específicos de muestreo), pero no se han encontrado datos en la información disponible, por lo que se indica "no disponible".

## Limitaciones y advertencias

- No es un modelo de lenguaje: pese a la etiqueta `feature-extraction`, no genera texto, no admite instrucciones y no tiene pesos. Cualquier expectativa de uso como LLM es un error de interpretación.
- Dominio restringido: solo cubre dinámica de Langevin en sistemas de baja dimensión con potenciales de juguete. No está pensado para sistemas moleculares reales ni para potenciales de muchos grados de libertad.
- Sesgo del estimador exponencial: a pocas trayectorias, βΔF presenta un sesgo apreciable. En la cuadrática ajustable y la trampa armónica se observan valores que se alejan del exacto con 100 o 500 trayectorias (por ejemplo, −0,153 frente a 0 en la trampa armónica con 500), y la versión con corrección de sesgo no elimina la desviación en esos regímenes.
- Error del contraste de Crooks: la pendiente ajustada es 0,911 frente al valor teórico 1,000 y R² = 0,82, con un error absoluto de 0,036 en ΔF. Es una verificación aproximada, no una medida de precisión alta.
- Dependencia de la discretización: los resultados utilizan Euler–Maruyama con `dt=1e-3` y 5.000 pasos. Pasos mayores pueden introducir error de integración no cuantificado en la documentación.
- Eventos raros: en el pozo doble, la estimación depende de trayectorias raras de bajo trabajo; con pocas muestras la varianza es alta (σ_W ≈ 2,3 en todos los tamaños reportados).
- Idioma: la documentación y los mensajes están en inglés; no hay versión en castellano.
- Madurez y mantenimiento: el repositorio registra 0 descargas y 1 like, con una sola actualización el mismo día de su creación. No hay evidencia de mantenimiento continuado, tests externos ni comunidad.
- Licencia: MIT, permisiva y compatible con uso comercial, pero sin garantías explícitas por parte del autor. Es responsabilidad del usuario validar los resultados físicos antes de usarlos en un contexto de producción o publicación.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/zeechimp/hv-fluctuation-os
- Perfil del autor en HuggingFace: https://huggingface.co/zeechimp
- Referencia bibliográfica de la igualdad de Jarzynski (1997) y del teorema de fluctuación de Crooks (1999): citadas en la model card sin enlace directo disponible.
- No se han encontrado en la búsqueda web enlaces específicos al paquete: papers, repositorios o demos adicionales. Los resultados devueltos (https://huggingface.co/, https://aliteq.com/archer-aviation-zee-ai-model-stock-jump-2026, https://arxiv.org/pdf/2302.06584v3, https://fluctuation.ai/, https://local-ai-zone.github.io/blog/September_2026_AI_Model_Updates.html) no guardan relación verificable con este artefacto.
